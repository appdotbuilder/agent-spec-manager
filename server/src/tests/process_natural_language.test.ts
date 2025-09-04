import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { type ProcessNaturalLanguageInput } from '../schema';
import { processNaturalLanguage } from '../handlers/process_natural_language';

describe('processNaturalLanguage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should extract agent name from explicit naming patterns', async () => {
    const input: ProcessNaturalLanguageInput = {
      description: 'Create an agent called "Email Monitor" that tracks incoming emails'
    };

    const result = await processNaturalLanguage(input);

    expect(result.name).toEqual('Email Monitor');
    expect(result.description).toEqual(input.description);
    expect(result.tools).toContain('email_tool');
  });

  it('should generate goal from description with explicit goal statement', async () => {
    const input: ProcessNaturalLanguageInput = {
      description: 'Build an agent whose goal is to automate file backups daily'
    };

    const result = await processNaturalLanguage(input);

    expect(result.goal).toMatch(/to automate file backups daily/i);
    expect(result.tools).toContain('file_manager');
    expect(result.tools).toContain('scheduler');
  });

  it('should suggest multiple relevant tools based on keywords', async () => {
    const input: ProcessNaturalLanguageInput = {
      description: 'Create a web scraping agent that fetches data from websites and stores it in a database'
    };

    const result = await processNaturalLanguage(input);

    expect(result.tools).toContain('web_scraper');
    expect(result.tools).toContain('database_tool');
    expect(result.name).toMatch(/web scraping/i);
    expect(result.goal).toMatch(/to create/i);
  });

  it('should handle email notification requirements', async () => {
    const input: ProcessNaturalLanguageInput = {
      description: 'I need an agent that monitors system health and sends email notifications when issues are detected'
    };

    const result = await processNaturalLanguage(input);

    expect(result.tools).toContain('email_tool');
    expect(result.instructions).toMatch(/email communications/i);
    expect(result.instructions).toMatch(/professional and clear/i);
    expect(result.goal).toMatch(/monitors system health/i);
  });

  it('should extract scheduling requirements', async () => {
    const input: ProcessNaturalLanguageInput = {
      description: 'Build a scheduling agent for managing appointments and calendar events'
    };

    const result = await processNaturalLanguage(input);

    expect(result.tools).toContain('calendar_tool');
    expect(result.tools).toContain('scheduler');
    expect(result.name).toMatch(/scheduling/i);
    expect(result.instructions).toMatch(/scheduling tasks/i);
    expect(result.instructions).toMatch(/time zones/i);
  });

  it('should handle API integration requirements', async () => {
    const input: ProcessNaturalLanguageInput = {
      description: 'Create an agent that calls external APIs to fetch weather data and process the responses'
    };

    const result = await processNaturalLanguage(input);

    expect(result.tools).toContain('api_client');
    expect(result.tools).toContain('text_processor');
    expect(result.goal).toMatch(/fetch weather data/i);
  });

  it('should generate appropriate instructions for web scraping', async () => {
    const input: ProcessNaturalLanguageInput = {
      description: 'Web crawler agent that browses websites and extracts product information'
    };

    const result = await processNaturalLanguage(input);

    expect(result.tools).toContain('web_scraper');
    expect(result.instructions).toMatch(/scraping web content/i);
    expect(result.instructions).toMatch(/robots\.txt/i);
    expect(result.instructions).toMatch(/rate limits/i);
  });

  it('should handle database operations', async () => {
    const input: ProcessNaturalLanguageInput = {
      description: 'Database management agent that queries and updates customer records'
    };

    const result = await processNaturalLanguage(input);

    expect(result.tools).toContain('database_tool');
    expect(result.instructions).toMatch(/working with databases/i);
    expect(result.instructions).toMatch(/data integrity/i);
    expect(result.instructions).toMatch(/appropriate queries/i);
  });

  it('should extract action-based agent names as fallback', async () => {
    const input: ProcessNaturalLanguageInput = {
      description: 'I want to automate the process of backing up files every night'
    };

    const result = await processNaturalLanguage(input);

    expect(result.name).toMatch(/automate/i);
    expect(result.name).toMatch(/agent/i);
    expect(result.tools).toContain('file_manager');
    expect(result.tools).toContain('scheduler');
  });

  it('should handle file management requirements', async () => {
    const input: ProcessNaturalLanguageInput = {
      description: 'File processing agent that reads documents and saves processed versions'
    };

    const result = await processNaturalLanguage(input);

    expect(result.tools).toContain('file_manager');
    expect(result.instructions).toMatch(/handle files carefully/i);
    expect(result.instructions).toMatch(/verify permissions/i);
  });

  it('should generate monitoring-specific instructions', async () => {
    const input: ProcessNaturalLanguageInput = {
      description: 'System monitoring agent that tracks server performance metrics'
    };

    const result = await processNaturalLanguage(input);

    expect(result.instructions).toMatch(/continuously monitor/i);
    expect(result.instructions).toMatch(/alert users/i);
    expect(result.instructions).toMatch(/important changes/i);
  });

  it('should provide default name when no clear pattern is found', async () => {
    const input: ProcessNaturalLanguageInput = {
      description: 'Something that does various tasks'
    };

    const result = await processNaturalLanguage(input);

    expect(result.name).toEqual('Smart Assistant Agent');
    expect(result.description).toEqual(input.description);
    expect(result.goal).toMatch(/something that does various tasks/i);
  });

  it('should handle complex multi-tool requirements', async () => {
    const input: ProcessNaturalLanguageInput = {
      description: 'Advanced automation agent that scrapes web data, processes it with calculations, stores in database, and sends email reports'
    };

    const result = await processNaturalLanguage(input);

    expect(result.tools).toContain('web_scraper');
    expect(result.tools).toContain('calculator');
    expect(result.tools).toContain('database_tool');
    expect(result.tools).toContain('email_tool');
    expect(result.instructions).toMatch(/data integrity/i);
    expect(result.instructions).toMatch(/professional and clear/i);
  });

  it('should handle image processing requirements', async () => {
    const input: ProcessNaturalLanguageInput = {
      description: 'Image analysis agent that processes photos and generates visual reports'
    };

    const result = await processNaturalLanguage(input);

    expect(result.tools).toContain('image_processor');
    expect(result.goal).toMatch(/image analysis/i);
  });

  it('should handle search functionality', async () => {
    const input: ProcessNaturalLanguageInput = {
      description: 'Research assistant that searches Google for information and compiles findings'
    };

    const result = await processNaturalLanguage(input);

    expect(result.tools).toContain('search_tool');
    expect(result.tools).toContain('text_processor');
    expect(result.name).toMatch(/research/i);
  });
});