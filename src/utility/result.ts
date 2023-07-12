export class Result<T> {
    public isSuccess: boolean;
    public isFailure: boolean;
    public error?: string;
    private _value?: T;

    private constructor(isSuccess: boolean, error?: string, value?: T) {
        if (isSuccess && error) {
            throw new Error(`InvalidOperation: A result cannot be 
          successful and contain an error`);
        }
        if (!isSuccess && !error) {
            throw new Error(`InvalidOperation: A failing result 
          needs to contain an error message`);
        }

        this.isSuccess = isSuccess;
        this.isFailure = !isSuccess;
        this.error = error;
        this._value = value;

        Object.freeze(this);
    }

    public getValue(): T {
        if (!this.isSuccess) {
            throw new Error(`Cant retrieve the value from a failed result.`);
        }

        return this._value!;
    }

    public valueOr(otherValue: T): T {
        return this.isSuccess ? this.getValue() : otherValue;
    }

    public map<U>(valueDelegate: (value: T) => Result<U>): Result<U> {
        if (this.isSuccess) {
            return valueDelegate(this.getValue());
        } else {
            return Result.fail<U>(this.error!);
        }
    }

    public pipe<U>(resultDelegate: (result: Result<T>) => U): U {
        return resultDelegate(this);
    }

    public mapPassThru<U>(valueDelegate: (value: T) => Result<U>): Result<T> {
        return this.map(valueDelegate).map((_) => this);
    }

    public mapAsOk<U>(valueDelegate: (value: T) => U): Result<U> {
        if (this.isSuccess) {
            return Result.ok<U>(valueDelegate(this.getValue()));
        } else {
            return Result.fail<U>(this.error!);
        }
    }

    public failIf(
        failIfTrueDelegate: (value: T) => boolean,
        failureMessageDelegate: (value: T) => string
    ): Result<T> {
        if (!this.isSuccess || !failIfTrueDelegate(this.getValue())) {
            return this;
        } else {
            return Result.fail<T>(failureMessageDelegate(this.getValue()));
        }
    }

    public match<U>(
        okDelegate: (value: T) => U,
        failDelegate: (error: string) => U
    ): U {
        return this.isSuccess
            ? okDelegate(this.getValue())
            : failDelegate(this.error!);
    }

    public matchOk(okDelegate: (value: T) => void): Result<T> {
        if (this.isSuccess) {
            okDelegate(this.getValue());
        }
        return this;
    }

    public matchFail(
        failDelegate: (error: string) => void | string
    ): Result<T> {
        if (this.isSuccess) {
            return this;
        } else {
            const result = failDelegate(this.error!);
            return !result ? this : Result.fail<T>(result);
        }
    }

    public static ok<U>(value?: U): Result<U> {
        return new Result<U>(true, undefined, value);
    }

    public static fail<U>(error: string): Result<U> {
        return new Result<U>(false, error);
    }

    /// combines and array of results into a result of an array or first failure
    public static combine<T>(results: Result<T>[]): Result<T[]> {
        return results.reduce(
            (end, r) =>
                end.isFailure
                    ? end
                    : r.match(
                          (_) => end,
                          (e) => Result.fail(e)
                      ),
            Result.ok(Result.okValues(results))
        );
    }

    public static okValues<T>(results: Result<T>[]): T[] {
        return results.filter((r) => r.isSuccess).map((r) => r.getValue());
    }

    public static okValuesOrFirstFail<T>(results: Result<T>[]): Result<T[]> {
        const errorIndex = results.findIndex((r) => r.isFailure);
        if (errorIndex >= 0) {
            return Result.fail(results[errorIndex].error!);
        } else {
            return Result.ok(this.okValues(results));
        }
    }
}
