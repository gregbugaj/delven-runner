export interface CallbackFunction<T = any> {
    (event: T): void;
}


export type EvaluationResult = {
    exception?: string | Error
    stdout?: string
    stderr?: string
}
// both the runner and explorer share this type
export type CompilationUnit = {
    id: string
    code: string,
    compileTime: number
    exception?: string
    ast?: any,
    generated?: string
}

/**
 * An executor is responsible for communication with the service that compiles/executes the code
 */
export interface IExecutor {
    id?: string

    /**
     * Compile script
     * @param script the script to compile
     */
    compile(unit: CompilationUnit): Promise<any>


    /**
     * Evaluate script in a sandbox environment
     * @param script the script to evaluate
     */
    evaluate(unit: CompilationUnit): Promise<EvaluationResult>

    /**
     * Perform cleanup
     */
    dispose()
}
