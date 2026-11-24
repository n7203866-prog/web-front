export const portableTextToHtml = (blocks) => {
  if (!Array.isArray(blocks)) return '';

  const linkMap = new Map();

  // جمع links
  blocks.forEach((block) => {
    if (block._type === 'link') {
      linkMap.set(block._key, block);
    }
  });

  let html = '';

  blocks.forEach((block) => {
    if (!block || block._type !== 'block') return;

    const style = block.style || 'normal';

    if (block.listItem) {
      const tag = block.listItem === 'number' ? 'ol' : 'ul';
      html += `<${tag}><li>${renderChildren(block.children, linkMap)}</li></${tag}>`;
      return;
    }

    if (style === 'h1') {
      html += `<h1>${renderChildren(block.children, linkMap)}</h1>`;
    } else if (style === 'h2') {
      html += `<h2>${renderChildren(block.children, linkMap)}</h2>`;
    } else if (style === 'h3') {
      html += `<h3>${renderChildren(block.children, linkMap)}</h3>`;
    } else if (style === 'blockquote') {
      html += `<blockquote>${renderChildren(block.children, linkMap)}</blockquote>`;
    } else if (style === 'horizontal-rule') {
      html += `<hr/>`;
    } else {
      html += `<p>${renderChildren(block.children, linkMap)}</p>`;
    }
  });

  return html;
};


// 👇 ده الجزء اللي بتسأل عليه
const renderChildren = (children = [], linkMap) => {
  return children.map((child) => {
    if (child._type !== 'span') return '';

    let text = child.text || '';

    // bold
    if (child.marks?.includes('strong')) {
      text = `<strong>${text}</strong>`;
    }

    // italic
    if (child.marks?.includes('em')) {
      text = `<em>${text}</em>`;
    }

    // links
    if (child.marks?.length) {
      const linkKey = child.marks.find((m) => linkMap.has(m));

      if (linkKey) {
        const link = linkMap.get(linkKey);
        return `<a href="${link.href}" target="_blank">${text}</a>`;
      }
    }

    return text;
  }).join('');
};