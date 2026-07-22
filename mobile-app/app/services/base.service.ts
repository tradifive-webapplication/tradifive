import { supabase } from '../utils/supabase';

/**
 * Base API Service configured with Supabase.
 * Handles generic CRUD operations with centralized error handling.
 */
export class BaseApiService {
  protected table: string;

  constructor(tableName: string) {
    this.table = tableName;
  }

  protected async handleResponse<T>(promise: any): Promise<T> {
    const { data, error } = await promise;
    if (error) {
      console.error(`[API Error in ${this.table}]:`, error.message);
      throw new Error(error.message);
    }
    return data as T;
  }

  async getAll<T>(select: string = '*'): Promise<T[]> {
    return this.handleResponse(supabase.from(this.table).select(select));
  }

  async getById<T>(id: string, select: string = '*'): Promise<T> {
    return this.handleResponse(supabase.from(this.table).select(select).eq('id', id).single());
  }

  async create<T>(payload: any): Promise<T> {
    return this.handleResponse(supabase.from(this.table).insert([payload]).select().single());
  }

  async update<T>(id: string, payload: any): Promise<T> {
    return this.handleResponse(supabase.from(this.table).update(payload).eq('id', id).select().single());
  }

  async delete(id: string): Promise<void> {
    await this.handleResponse(supabase.from(this.table).delete().eq('id', id));
  }
}
