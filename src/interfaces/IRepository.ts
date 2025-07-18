/**
 * Interface base para repositórios seguindo o padrão Repository
 * Aplica o Dependency Inversion Principle (DIP)
 */
export interface IRepository<T, K = number> {
  findById(id: K): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: K, entity: Partial<T>): Promise<T>;
  delete(id: K): Promise<void>;
}

/**
 * Interface específica para repositório de quartos
 * Aplica o Interface Segregation Principle (ISP)
 */
export interface IQuartoRepository extends IRepository<Quarto> {
  findByAvailability(disponivel: boolean): Promise<Quarto[]>;
  findWithImages(id: number): Promise<QuartoWithImages | null>;
}

/**
 * Interface específica para repositório de reservas
 * Aplica o Interface Segregation Principle (ISP)
 */
export interface IReservaRepository extends IRepository<Reserva> {
  findByStatus(estado: string): Promise<Reserva[]>;
  findByQuarto(quartoId: number): Promise<Reserva[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Reserva[]>;
}

/**
 * Interface específica para repositório de propriedades
 * Aplica o Interface Segregation Principle (ISP)
 */
export interface IPropriedadeRepository extends IRepository<Propriedade> {
  findWithAmenities(id: number): Promise<PropriedadeWithAmenities | null>;
  updateAmenities(id: number, amenityIds: number[]): Promise<void>;
}

/**
 * Interface para repositório de comodidades
 * Aplica o Interface Segregation Principle (ISP)
 */
export interface IComodidadeRepository extends IRepository<Comodidade> {
  findByProperty(propertyId: number): Promise<Comodidade[]>;
}