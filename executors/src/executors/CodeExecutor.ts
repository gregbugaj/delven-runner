import { IExecutor, CallbackFunction, CompilationUnit, EvaluationResult } from './executor';
import { ASTParser, SourceGenerator } from "delven";
const stream = require('stream')
const { VM, NodeVM, VMScript } = require('vm2');

/**
 * Code compiler
 */
export default class CodeExecutor implements IExecutor {
    id?: string

    constructor() {
        console.info(`Setting up executor`)
    }

    capture(callback: CallableFunction) {
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

            console.log('capture #1')
            callback()

            console.info('capture #2')
        } catch (ex) {
            exception = ex
            console.log(ex)
        } finally {
            console = _org
        }

        console.info('\x1B[96mCaptured stdout\x1B[00m' + new Date().getTime())
        let fs = require('fs')
        fs.writeFile('./buffer.txt', buffer, { encoding: 'utf8', flag: "a" },
            (err) => {
                if (err) {
                    return console.log(err);
                }
            });

        return buffer
    }

    evaluate(unit: CompilationUnit): Promise<EvaluationResult> {
        return new Promise((resolve, reject) => {
            console.info("Evaluating script")
            const script = unit.code
            // Compile script in order to find compilation errors first
            try {
                const status = new VMScript(script, 'sandbox.js').compile();
                console.info('Compilation status', status)
            } catch (err) {
                console.error('Failed to compile script.', err);
                return resolve({ "exception": err, stdout: "", stderr: "" })
            }

            const start = Date.now();
            const vm = new VM({
                require: {
                    external: true
                },
                console: 'inherit',
                compiler: 'javascript',
                fixAsync: false,
                sandbox: {
                    done: (arg) => {
                        console.info('Sandbox complete : ' + Date.now())
                    }
                }
            });

            process.on('uncaughtException', function (err) {
                console.log('Caught exception: ' + err);
            });

            let buff = this.capture(()=>{
                try {
                    let code = `
                        async function main() {
                            console.info('Eval : start')
                            ${script}
                            console.info('Eval : complete')
                            // setTimeout(function(){ console.info("Timeout task"); }, 2000);
                        }

                        (async () => {
                            await main()
                            done()
                        })().catch(err => {
                            console.error("error in main", err)
                        })
                    `
                    let exec = vm.run(code);
                } catch (err) {
                    console.error('Failed to execute script.', err);
                }
            })

            console.info('LOG 2')
            console.info(buff)
            return resolve({ "exception": null, stdout: buff, stderr: "" })
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