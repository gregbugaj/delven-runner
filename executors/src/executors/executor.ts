export interface CallbackFunction<T = any> {
    (event: T): void;
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
     * Perform cleanup
     */
    dispose()
}
