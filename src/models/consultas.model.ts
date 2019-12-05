import { model, property, Entity } from '@loopback/repository';

@model({ settings: {} })
export class Consultas extends Entity {
  @property({
    id: true,
    description: 'El identificador único de la consulta',
  })
  _id: string;
  @property({
    type: 'string',
    required: true,
  })
  nombre: string;

  @property({
    type: 'string',
    required: true,
  })
  coleccion: string;

  @property({
    type: 'string',
    required: true,
  })
  query: string;
  @property({
    type: 'string',
    required: true,
  })
  argumentos: [{
    key: string,
    etiqueta: string,
    tipo: string
  }]


  constructor(data?: Partial<Consultas>) {
    super(data);
  }
}

export interface ConsultasRelations {
  // describe navigational properties here
}

export type ConsultasWithRelations = Consultas & ConsultasRelations;
