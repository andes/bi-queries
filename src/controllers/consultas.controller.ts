import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import { Consultas } from '../models';
import { ConsultasRepository } from '../repositories';

export class ConsultasController {
  constructor(
    @repository(ConsultasRepository)
    public consultasRepository: ConsultasRepository,
  ) { }

  @get('/consultas/{nombre}', {
    responses: {
      '200': {
        description: 'Devuelve la consulta en mongo que tiene ese nombre',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Consultas) },
          },
        },
      },
    },
  })
  async querybyName(
    @param.query.object('filter', getFilterSchemaFor(Consultas)) filter?: Filter<Consultas>,
  ): Promise<Consultas[]> {
    // Seguir laburando acá!!!
    return this.consultasRepository.find(filter);
  }


  @post('/consultas', {
    responses: {
      '200': {
        description: 'Consultas model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Consultas) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Consultas, {
            title: 'NewConsultas',
            exclude: ['id'],
          }),
        },
      },
    })
    consultas: Omit<Consultas, 'id'>,
  ): Promise<Consultas> {
    return this.consultasRepository.create(consultas);
  }

  @get('/consultas/count', {
    responses: {
      '200': {
        description: 'Consultas model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Consultas)) where?: Where<Consultas>,
  ): Promise<Count> {
    return this.consultasRepository.count(where);
  }

  @get('/consultas', {
    responses: {
      '200': {
        description: 'Array of Consultas model instances',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Consultas) },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Consultas)) filter?: Filter<Consultas>,
  ): Promise<Consultas[]> {
    return this.consultasRepository.find(filter);
  }

  @patch('/consultas', {
    responses: {
      '200': {
        description: 'Consultas PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Consultas, { partial: true }),
        },
      },
    })
    consultas: Consultas,
    @param.query.object('where', getWhereSchemaFor(Consultas)) where?: Where<Consultas>,
  ): Promise<Count> {
    return this.consultasRepository.updateAll(consultas, where);
  }

  @get('/consultas/{id}', {
    responses: {
      '200': {
        description: 'Consultas model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Consultas) } },
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<Consultas> {
    return this.consultasRepository.findById(id);
  }

  @patch('/consultas/{id}', {
    responses: {
      '204': {
        description: 'Consultas PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Consultas, { partial: true }),
        },
      },
    })
    consultas: Consultas,
  ): Promise<void> {
    await this.consultasRepository.updateById(id, consultas);
  }

  @put('/consultas/{id}', {
    responses: {
      '204': {
        description: 'Consultas PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() consultas: Consultas,
  ): Promise<void> {
    await this.consultasRepository.replaceById(id, consultas);
  }

  @del('/consultas/{id}', {
    responses: {
      '204': {
        description: 'Consultas DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.consultasRepository.deleteById(id);
  }
}
