# Delven Runner

Runner is the component of Delven that will run a job on some form of compute instance. 
Primary job is scheduling instances to be ready to execute jobs on, this could be a (VM, Docker, Local instance, etc)


## Development : install dependencies

```bash
npm install typescript --save-dev
npm install --save-dev typescript
npm install express body-parser nodemon --save

npm install --save-dev ts-node tsconfig-paths
npm install @types/express --save-dev
npm install @types/node--save-dev
```

Start both the TS watcher and `nodemon` to monitor for changes 

```bash
npm run watch-ts
npm run dev
```


### Linking to local delven-transpiler

```sh
cd ./delven-transpiler 
npm link 

cd ./delven-runner/executor
npm link ../../delven-transpiler/lib/
```


## References  