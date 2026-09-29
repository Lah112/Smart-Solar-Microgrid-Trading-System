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
        // Retrieves all documents in the collection.
        Task<List<T>> GetAllAsync();
        // Retrieves documents matching a filter.
        Task<List<T>> FindAsync(Expression<Func<T, bool>> filter);
        // Retrieves the first document matching a filter.
        Task<T?> FindOneAsync(Expression<Func<T, bool>> filter);
        // Retrieves a document by its MongoDB ObjectId.
        Task<T?> GetByIdAsync(string id);
        // Inserts one document into the collection.
        Task InsertAsync(T entity);
        // Inserts multiple documents into the collection.
        Task InsertManyAsync(IEnumerable<T> entities);
        // Replaces a document identified by its ID.
        Task<bool> UpdateAsync(string id, T entity);
        // Updates the first document matching a filter.
        Task<bool> UpdateOneAsync(Expression<Func<T, bool>> filter, UpdateDefinition<T> update);
        // Deletes a document identified by its ID.
        Task<bool> DeleteAsync(string id);
        // Counts documents matching a filter.
        Task<long> CountAsync(Expression<Func<T, bool>> filter);
    }
}
