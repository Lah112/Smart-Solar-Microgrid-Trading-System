/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: IMongoRepository.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Generic MongoDB repository interface defining asynchronous CRUD operations.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using MongoDB.Driver;

namespace SmartSolar.API.Repositories
{
    /// <summary>
    /// Generic repository interface for MongoDB collection operations.
    /// </summary>
    /// <typeparam name="T">Document entity type.</typeparam>
    public interface IMongoRepository<T> where T : class
    {
        IMongoCollection<T> Collection { get; }
        Task<List<T>> GetAllAsync();
        Task<List<T>> FindAsync(Expression<Func<T, bool>> filter);
        Task<T?> FindOneAsync(Expression<Func<T, bool>> filter);
        Task<T?> GetByIdAsync(string id);
        Task InsertAsync(T entity);
        Task InsertManyAsync(IEnumerable<T> entities);
        Task<bool> UpdateAsync(string id, T entity);
        Task<bool> UpdateOneAsync(Expression<Func<T, bool>> filter, UpdateDefinition<T> update);
        Task<bool> DeleteAsync(string id);
        Task<long> CountAsync(Expression<Func<T, bool>> filter);
    }
}
