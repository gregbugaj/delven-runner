import { IExecutor, CallbackFunction, CompilationUnit, EvaluationResult} from './executor';
import { ASTParser, SourceGenerator } from "delven";
const stream = require('stream')
const {VM} = require('vm2');


/**
 * Code compiler
 */
export default class CodeExecutor implements IExecutor {
    id?: string

    constructor() {
        console.info(`Setting up executor`)
        
        const vm = new VM();
        vm.run(`process.exit()`); // TypeError: process.exit is not a function
    }
    
    evaluate(script: string): Promise<EvaluationResult> {
        return new Promise((resolve, reject) => {
            const _org = console;

            const original = {
                stdout: process.stdout,
                stderr: process.stderr
            }

            const collection = {
                stdout: new stream.Writable(),
                stderr: new stream.Writable()
            }

            let buffer = ""

            Object.keys(collection).forEach((name) => {
                collection[name].write = function (chunk, encoding, callback) {
                    _org.log(chunk)
                    buffer += chunk;
                    original[name].write(chunk, encoding, callback)
                }
            })

            const options = {}
            const overwrites = Object.assign({}, {
                stdout: collection.stdout,
                stderr: collection.stderr
            }, options)

            let exception: string | undefined
            try {

                const Console = console.Console
                console = new Console(overwrites)
                let _eval = (str) => {
                    return Function(` ${str}`)
                }

                const fragment = `
                    'use strict'; 
                    try {
                        ${script}
                    } catch(e){
                        console.error(e)
                    }
                `

                _eval(fragment)()

            } catch (ex) {
                exception = ex
                console.log(ex)
            } finally {
                console = _org
            }

            console.info('\x1B[96mCaptured stdout\x1B[00m' + new Date().getTime())
            console.log(buffer)

            let fs = require('fs')
            fs.writeFile('./buffer.txt', buffer, { encoding: 'utf8', flag: "a" },
                (err) => {
                    if (err) {
                        return console.log(err);
                    }
                });

            return  resolve({ "exception": exception, stdout: buffer, stderr: "" })
        });
    }

    async compile(unit: CompilationUnit): Promise<CompilationUnit> {
        return new Promise((resolve, reject) => {
            try {
                const code = unit.code
                const start = Date.now()
                const generator = new SourceGenerator();

                console.info('Compiling script')
                console.info('---------------')
                console.log(code);
                console.info('---------------')

                unit.ast = ASTParser.parse({ type: "code", value: code });
                unit.generated = generator.toSource(unit.ast);
                unit.compileTime = Date.now() - start

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