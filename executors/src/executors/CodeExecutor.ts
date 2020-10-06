import { IExecutor, CallbackFunction, CompilationUnit } from './executor';
import { ASTParser, SourceGenerator } from "delven";

/**
 * Code compiler
 */
export default class CodeExecutor implements IExecutor {
    id?: string

    constructor() {
        console.info(`Setting up executor`)
    }

    async compile(unit: CompilationUnit): Promise<CompilationUnit> {
        return new Promise((resolve, reject) => {
            try {
                let code = unit.code
                console.info('Compiling script')
                console.info('---------------')
                console.log(code);
                console.info('---------------')
                let start = Date.now()
                const generator = new SourceGenerator();
                unit.ast = ASTParser.parse({ type: "code", value: code });
                unit.generated = generator.toSource(unit.ast);
                unit.compileTime = Date.now() -start
                return resolve(unit)
            } catch (e) {
                reject(e)
            }
        })
    }

    public async dispose() {
        // noop
    }
}