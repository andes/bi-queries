import { DefaultCrudRepository } from '@loopback/repository';
import { Consultas, ConsultasRelations } from '../models';
import { AndesDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class ConsultasRepository extends DefaultCrudRepository<
  Consultas,
  typeof Consultas.prototype._id,
  ConsultasRelations
  > {
  constructor(
    @inject('datasources.andes') dataSource: AndesDataSource,
  ) {
    super(Consultas, dataSource);
  }
}
