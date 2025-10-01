const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function syncNotion() {
  try {
    // Create docs folder if it doesn't exist
    const docsDir = './docs';
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
      console.log('Created docs directory');
    }

    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
    });

    console.log(`Found ${response.results.length} pages`);

    for (const page of response.results) {
      const pageId = page.id;
      
      // Get the title - adjust 'Name' to match your database property
      const titleProperty = page.properties['Doc name'] || page.properties.Name || page.properties.title;
      const title = titleProperty?.title?.[0]?.plain_text || 'untitled';
      
      // Sanitize filename
      const fileName = title.replace(/[/\\?%*:|"<>]/g, '-').trim();
      
      console.log(`Processing: ${fileName}`);
      
      // Get page content
      const blocks = await notion.blocks.children.list({ block_id: pageId });
      
      // Convert to markdown
      const markdown = `# ${title}\n\n${convertToMarkdown(blocks.results)}`;
      
      // Save file
      const filePath = path.join(docsDir, `${fileName}.md`);
      fs.writeFileSync(filePath, markdown);
      
      console.log(`✓ Synced: ${fileName}.md`);
    }
    
    console.log('Sync completed successfully!');
  } catch (error) {
    console.error('Error during sync:', error);
    throw error;
  }
}

function convertToMarkdown(blocks) {
  return blocks.map(block => {
    if (block.paragraph?.rich_text) {
      return block.paragraph.rich_text.map(t => t.plain_text).join('');
    }
    if (block.heading_1?.rich_text) {
      return '# ' + block.heading_1.rich_text.map(t => t.plain_text).join('');
    }
    if (block.heading_2?.rich_text) {
      return '## ' + block.heading_2.rich_text.map(t => t.plain_text).join('');
    }
    if (block.heading_3?.rich_text) {
      return '### ' + block.heading_3.rich_text.map(t => t.plain_text).join('');
    }
    if (block.bulleted_list_item?.rich_text) {
      return '- ' + block.bulleted_list_item.rich_text.map(t => t.plain_text).join('');
    }
    if (block.numbered_list_item?.rich_text) {
      return '1. ' + block.numbered_list_item.rich_text.map(t => t.plain_text).join('');
    }
    return '';
  }).filter(text => text).join('\n\n');
}

syncNotion();