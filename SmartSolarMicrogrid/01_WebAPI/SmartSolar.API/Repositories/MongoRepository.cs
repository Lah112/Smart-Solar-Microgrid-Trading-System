/**
 * ============================================================================
 * Project: Smart Solar Microgrid Trading System
 * File: MongoRepository.cs
 * Author: SE4040 Enterprise Application Development Team
 * Description: Generic MongoDB repository implementation utilizing MongoDB.Driver.
 * Module: SE4040 Enterprise Application Development (Year 4 Semester 2)
 * ============================================================================
 */

using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using SmartSolar.API.Models;

namespace SmartSolar.API.Repositories
{
    /// <summary>
    /// Generic implementation of IMongoRepository against MongoDB database.
    /// </summary>
    /// <typeparam name="T">Entity type.</typeparam>
    public class MongoRepository<T> : IMongoRepository<T> where T : class
    {
        private readonly IMongoCollection<T> _collection;

        /// <summary>
        /// Constructor initializing MongoDB client, database, and collection reference.
        /// </summary>
        public MongoRepository(IOptions<DatabaseSettings> settings, string collectionName)
        {
            // Inline comment: Connect to MongoDB using configured connection string
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _collection = database.GetCollection<T>(collectionName);
        }

        public IMongoCollection<T> Collection => _collection;

        /// <summary>
        /// Retrieves all documents from the collection.
        /// </summary>
        public async Task<List<T>> GetAllAsync()
        {
            // Inline comment: Asynchronously find all records
            return await _collection.Find(_ => true).ToListAsync();
        }

        /// <summary>
        /// Finds documents matching a specific expression filter.
        /// </summary>
        public async Task<List<T>> FindAsync(Expression<Func<T, bool>> filter)
        {
            // Inline comment: Find documents matching predicate
            return await _collection.Find(filter).ToListAsync();
        }

        /// <summary>
        /// Finds the first single document matching a specific expression filter.
        /// </summary>
        public async Task<T?> FindOneAsync(Expression<Func<T, bool>> filter)
        {
            // Inline comment: Find first document or default
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Retrieves a document by its ObjectId string.
        /// </summary>
        public async Task<T?> GetByIdAsync(string id)
        {
            // Inline comment: Find by ObjectId filter
            var filter = Builders<T>.Filter.Eq("_id", ObjectId.Parse(id));
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Inserts a new document entity into the collection.
        /// </summary>
        public async Task InsertAsync(T entity)
        {
            // Inline comment: Insert single document
            await _collection.InsertOneAsync(entity);
        }

        /// <summary>
        /// Inserts multiple documents in bulk.
        /// </summary>
        public async Task InsertManyAsync(IEnumerable<T> entities)
        {
            // Inline comment: Insert many documents
            await _collection.InsertManyAsync(entities);
        }

        /// <summary>
        /// Replaces an existing document by its ID.
        /// </summary>
        public async Task<bool> UpdateAsync(string id, T entity)
        {
            // Inline comment: Replace document by ObjectId
            var filter = Builders<T>.Filter.Eq("_id", ObjectId.Parse(id));
            var result = await _collection.ReplaceOneAsync(filter, entity);
            return result.ModifiedCount > 0;
        }

        /// <summary>
        /// Updates a single document matching a filter with an update definition.
        /// </summary>
        public async Task<bool> UpdateOneAsync(Expression<Func<T, bool>> filter, UpdateDefinition<T> update)
        {
            // Inline comment: Update one document with definition
            var result = await _collection.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }

        /// <summary>
        /// Deletes a document by its ID.
        /// </summary>
        public async Task<bool> DeleteAsync(string id)
        {
            // Inline comment: Delete document matching ObjectId
            var filter = Builders<T>.Filter.Eq("_id", ObjectId.Parse(id));
            var result = await _collection.DeleteOneAsync(filter);
            return result.DeletedCount > 0;
        }

        /// <summary>
        /// Counts documents matching a specific expression filter.
        /// </summary>
        public async Task<long> CountAsync(Expression<Func<T, bool>> filter)
        {
            // Inline comment: Count documents matching filter
            return await _collection.CountDocumentsAsync(filter);
        }
    }
}
