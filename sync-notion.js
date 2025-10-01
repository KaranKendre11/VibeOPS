const { Client } = require('@notionhq/client');
const fs = require('fs');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function syncNotion() {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
  });

  for (const page of response.results) {
    const pageId = page.id;
    const title = page.properties.Name?.title[0]?.plain_text || 'untitled';
    
    // Get page content
    const blocks = await notion.blocks.children.list({ block_id: pageId });
    
    // Convert to markdown and save
    const markdown = convertToMarkdown(blocks.results);
    fs.writeFileSync(`docs/${title}.md`, markdown);
  }
}

function convertToMarkdown(blocks) {
  // Implement conversion logic based on block types
  return blocks.map(block => {
    // Convert each block type to markdown
    // This is simplified - you'll need to handle different block types
    return block.paragraph?.rich_text[0]?.plain_text || '';
  }).join('\n\n');
}

syncNotion();