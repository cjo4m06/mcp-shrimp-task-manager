/**
 * Tests for the Specification Manager component
 * 
 * This file contains tests for the Specification Manager component of the Idea Honing Tool.
 */

import { expect, use } from 'chai';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Use sinon-chai plugin
use(sinonChai);

// Import the component to test
import {
  createSpecification,
  getSpecification,
  updateSpecification,
  listAllSpecifications,
  searchSpecifications,
  rebuildSearchIndex
} from '../components/specification-manager.js';

// Import dependencies for mocking
import * as fileSystem from '../utils/file-system.js';
import * as templateEngine from '../components/template-engine.js';
import * as searchIndexer from '../utils/search-indexer.js';

// Import Template interface
interface Template {
  name: string;
  content: string;
  sections: Array<{
    id: string;
    title: string;
    placeholder: string;
    required: boolean;
    order: number;
    condition?: string;
  }>;
}

// Import models
import {
  SpecificationDocument,
  SpecSection,
  SpecMetadata,
  ChangeRecord
} from '../models/specification.js';

// Test suite
describe('Specification Manager', () => {
  // Setup sandbox for stubs and mocks
  let sandbox: sinon.SinonSandbox;
  
  // Sample data for tests
  const sampleSpecId = '12345';
  const sampleTitle = 'Test Specification';
  const sampleDescription = 'This is a test specification';
  const sampleAuthor = 'Test Author';
  const sampleTemplate: Template = {
    name: 'test-template',
    content: '# {{title}}\n\n{{description}}\n\n## Requirements\n\n## Design\n\n## Implementation',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        placeholder: 'Provide an overview',
        required: true,
        order: 1
      },
      {
        id: 'requirements',
        title: 'Requirements',
        placeholder: 'List requirements',
        required: true,
        order: 2
      }
    ]
  };
  
  const sampleSpecification: SpecificationDocument = {
    id: sampleSpecId,
    title: sampleTitle,
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        content: sampleDescription,
        order: 1
      },
      {
        id: 'requirements',
        title: 'Requirements',
        content: 'Test requirements',
        order: 2
      }
    ],
    metadata: {
      authors: [sampleAuthor],
      status: 'draft',
      tags: ['test'],
      relatedSpecs: []
    },
    version: 1,
    changeHistory: [],
    projectId: 'default',
    featureId: '',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Setup before each test
  beforeEach(() => {
    // Create a sandbox for stubs
    sandbox = sinon.createSandbox();
    
    // Stub file system operations
    sandbox.stub(fileSystem, 'saveSpecification').resolves();
    sandbox.stub(fileSystem, 'loadSpecification').resolves(sampleSpecification);
    sandbox.stub(fileSystem, 'createBackup').resolves();
    sandbox.stub(fileSystem, 'saveChangeRecord').resolves();
    sandbox.stub(fileSystem, 'listSpecifications').resolves([sampleSpecId]);
    
    // Stub template engine operations
    sandbox.stub(templateEngine, 'loadTemplate').resolves(sampleTemplate);
    sandbox.stub(templateEngine, 'createSectionsFromTemplate').returns(sampleSpecification.sections);
    sandbox.stub(templateEngine, 'renderTemplate').returns(sampleTemplate.content);
    
    // Stub search indexer operations
    sandbox.stub(searchIndexer, 'indexSpecification').resolves();
    sandbox.stub(searchIndexer, 'buildSearchIndex').resolves();
    sandbox.stub(searchIndexer, 'searchSpecifications').resolves([
      {
        id: sampleSpecId,
        title: sampleTitle,
        description: sampleDescription,
        projectId: 'default',
        featureId: '',
        status: 'draft',
        relevance: 1.0,
        matchingSections: ['Overview'],
        matchingKeywords: ['test']
      }
    ]);
  });
  
  // Cleanup after each test
  afterEach(() => {
    // Restore all stubs
    sandbox.restore();
  });
  
  // Test cases
  describe('createSpecification', () => {
    it('should create a new specification with the provided data', async () => {
      // Call the function
      const result = await createSpecification(
        sampleTitle,
        sampleDescription,
        sampleAuthor
      );
      
      // Verify the result
      expect(result).to.be.an('object');
      expect(result.title).to.equal(sampleTitle);
      expect(result.metadata.authors).to.include(sampleAuthor);
      expect(result.version).to.equal(1);
      
      // Verify that the file system operations were called
      expect(fileSystem.saveSpecification).to.have.been.calledOnce;
      expect(fileSystem.saveChangeRecord).to.have.been.calledOnce;
      
      // Verify that the search indexer was called
      expect(searchIndexer.indexSpecification).to.have.been.calledOnce;
    });
    
    it('should handle errors during specification creation', async () => {
      // Restore the stub and create a new one that throws an error
      sandbox.restore();
      sandbox.stub(fileSystem, 'saveSpecification').throws(new Error('Test error'));
      
      // Call the function and expect it to throw
      try {
        await createSpecification(
          sampleTitle,
          sampleDescription,
          sampleAuthor
        );
        // If we get here, the test should fail
        expect.fail('Expected an error to be thrown');
      } catch (error) {
        // Verify that the error was thrown
        expect(error).to.be.an('error');
        expect((error as Error).message).to.include('Failed to create specification');
      }
    });
  });
  
  describe('getSpecification', () => {
    it('should retrieve a specification by ID', async () => {
      // Call the function
      const result = await getSpecification(sampleSpecId);
      
      // Verify the result
      expect(result).to.be.an('object');
      expect(result.id).to.equal(sampleSpecId);
      expect(result.title).to.equal(sampleTitle);
      
      // Verify that the file system operations were called
      expect(fileSystem.loadSpecification).to.have.been.calledOnce;
      expect(fileSystem.loadSpecification).to.have.been.calledWith(sampleSpecId);
    });
    
    it('should handle errors during specification retrieval', async () => {
      // Restore the stub and create a new one that throws an error
      sandbox.restore();
      sandbox.stub(fileSystem, 'loadSpecification').throws(new Error('Test error'));
      
      // Call the function and expect it to throw
      try {
        await getSpecification(sampleSpecId);
        // If we get here, the test should fail
        expect.fail('Expected an error to be thrown');
      } catch (error) {
        // Verify that the error was thrown
        expect(error).to.be.an('error');
        expect((error as Error).message).to.include('Failed to retrieve specification');
      }
    });
  });
  
  describe('updateSpecification', () => {
    it('should update a specification with the provided data', async () => {
      // Create update data
      const updates: Partial<SpecificationDocument> = {
        title: 'Updated Title',
        metadata: {
          status: 'review',
          tags: ['test', 'updated'],
          authors: [sampleAuthor],
          relatedSpecs: []
        }
      };
      
      // Call the function
      const result = await updateSpecification(
        sampleSpecId,
        updates,
        sampleAuthor,
        'Updated title'
      );
      
      // Verify the result
      expect(result).to.be.an('object');
      expect(result.title).to.equal(updates.title);
      if (updates.metadata?.status) {
        expect(result.metadata.status).to.equal(updates.metadata.status);
      }
      expect(result.version).to.equal(2); // Version should be incremented
      
      // Verify that the file system operations were called
      expect(fileSystem.loadSpecification).to.have.been.calledOnce;
      expect(fileSystem.createBackup).to.have.been.calledOnce;
      expect(fileSystem.saveSpecification).to.have.been.calledOnce;
      
      // Verify that the search indexer was called
      expect(searchIndexer.indexSpecification).to.have.been.calledOnce;
    });
  });
  
  describe('searchSpecifications', () => {
    it('should search for specifications matching a query', async () => {
      // Call the function
      const results = await searchSpecifications('test');
      
      // Verify the results
      expect(results).to.be.an('array');
      expect(results.length).to.be.greaterThan(0);
      expect(results[0].id).to.equal(sampleSpecId);
      expect(results[0].title).to.equal(sampleTitle);
      
      // Verify that the search indexer was called
      expect(searchIndexer.searchSpecifications).to.have.been.calledOnce;
      expect(searchIndexer.searchSpecifications).to.have.been.calledWith('test');
    });
    
    it('should handle errors during search and fall back to basic search', async () => {
      // Restore the stub and create a new one that throws an error
      sandbox.restore();
      sandbox.stub(searchIndexer, 'searchSpecifications').throws(new Error('Test error'));
      sandbox.stub(fileSystem, 'listSpecifications').resolves([sampleSpecId]);
      sandbox.stub(fileSystem, 'loadSpecification').resolves(sampleSpecification);
      
      // Call the function
      const results = await searchSpecifications('test');
      
      // Verify the results
      expect(results).to.be.an('array');
      expect(results.length).to.be.greaterThan(0);
      expect(results[0].id).to.equal(sampleSpecId);
    });
  });
  
  describe('rebuildSearchIndex', () => {
    it('should rebuild the search index', async () => {
      // Call the function
      await rebuildSearchIndex();
      
      // Verify that the search indexer was called
      expect(searchIndexer.buildSearchIndex).to.have.been.calledOnce;
    });
    
    it('should handle errors during index rebuilding', async () => {
      // Restore the stub and create a new one that throws an error
      sandbox.restore();
      sandbox.stub(searchIndexer, 'buildSearchIndex').throws(new Error('Test error'));
      
      // Call the function and expect it to throw
      try {
        await rebuildSearchIndex();
        // If we get here, the test should fail
        expect.fail('Expected an error to be thrown');
      } catch (error) {
        // Verify that the error was thrown
        expect(error).to.be.an('error');
        expect((error as Error).message).to.include('Failed to rebuild search index');
      }
    });
  });
});
