import mongoose, { Mongoose } from 'mongoose'

type ModelDeclaration = [string, mongoose.Schema]
type ModelDeclarations = ModelDeclaration[]
type Model = mongoose.Model<mongoose.Document<any, {}>, {}>

class ModelRegistry {
  static _instance: ModelRegistry
  registers: { [key: string]: any } = {}
  static _getInstance(): ModelRegistry {
    if (!ModelRegistry._instance) {
      ModelRegistry._instance = new ModelRegistry()
    }
    return ModelRegistry._instance
  }

  static register(modelDeclaration: ModelDeclaration): Model {
    const [name, schema] = modelDeclaration

    const inst = ModelRegistry._getInstance()
    const model = mongoose.model(name, schema)
    inst.registers[name] = { schema, model }
    return model
  }

  /**
   * declare which models are needed for this module
   */
  static depend(modelDeclarations: ModelDeclarations): Model[] {
    const models: Model[] = []
    modelDeclarations.forEach((modelDeclaration) => {
      const name = modelDeclaration[0]
      const inst = ModelRegistry._getInstance()
      if (inst.isRegistered(name)) {
        // do nothing
        models.push(inst.registers[name].model)
      } else {
        const model = ModelRegistry.register(modelDeclaration)
        models.push(model)
      }
    })
    return models
  }

  isRegistered(name: string) {
    return !!this.registers[name]
  }
}

export { ModelRegistry }
