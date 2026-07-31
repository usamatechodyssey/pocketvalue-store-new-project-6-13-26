// import { SanityImageObject } from "@/types";

// // --- TEXT FORMATTING CONSTANTS ---
// // Payload Lexical format bitmask use karta hai
// const IS_BOLD = 1;
// const IS_ITALIC = 2;
// const IS_STRIKETHROUGH = 4;
// const IS_UNDERLINE = 8;
// const IS_CODE = 16;
// const IS_SUBSCRIPT = 32;
// const IS_SUPERSCRIPT = 64;

// // --- RECURSIVE CHILD MAPPER ---
// // Ye function text, links, aur formatting ko handle karta hai
// const mapChildrenToSpans = (children: any[], markDefs: any[]) => {
//   return children?.flatMap((child: any) => {
//     // 1. Agar simple text hai
//     if (child.type === 'text') {
//       const marks = [];
//       if (child.format & IS_BOLD) marks.push('strong');
//       if (child.format & IS_ITALIC) marks.push('em');
//       if (child.format & IS_STRIKETHROUGH) marks.push('strike-through');
//       if (child.format & IS_UNDERLINE) marks.push('underline');
//       if (child.format & IS_CODE) marks.push('code');

//       return {
//         _type: 'span',
//         _key: Math.random().toString(36).substring(2, 9), // Random Key for uniqueness
//         text: child.text || '',
//         marks: marks
//       };
//     }

//     // 2. Agar Link hai
//     if (child.type === 'link') {
//       const linkKey = `link-${Math.random().toString(36).substring(2, 9)}`;
      
//       // Link ki definition block level par add karo
//       markDefs.push({
//         _key: linkKey,
//         _type: 'link',
//         href: child.fields?.url || child.url || '#',
//       });

//       // Link ke andar jo text hai usay wapis text node banao aur link mark lagao
//       return (child.children || []).map((grandChild: any) => ({
//         _type: 'span',
//         _key: Math.random().toString(36).substring(2, 9),
//         text: grandChild.text || '',
//         marks: [linkKey] // Link ko reference karo
//       }));
//     }

//     return [];
//   }) || [];
// };

// // --- 🔥 THE MASTER CONVERTER ---
// export const lexicalToPortableText = (lexicalData: any) => {
//   if (!lexicalData || !lexicalData.root || !lexicalData.root.children) return null;

//   return lexicalData.root.children.flatMap((block: any, index: number) => {
    
//     // --- CASE A: HEADINGS & PARAGRAPHS ---
//     if (block.type === 'paragraph' || block.type === 'heading') {
//       let style = 'normal';
//       if (block.tag === 'h1') style = 'h1';
//       if (block.tag === 'h2') style = 'h2';
//       if (block.tag === 'h3') style = 'h3';
//       if (block.tag === 'h4') style = 'h4';
//       if (block.tag === 'h5') style = 'h5';
//       if (block.tag === 'h6') style = 'h6';
//       if (block.type === 'quote') style = 'blockquote';

//       const markDefs: any[] = []; // Links store karne ke liye
//       const children = mapChildrenToSpans(block.children, markDefs);

//       // Agar block khali hai to ignore karo
//       if (children.length === 0) return [];

//       return {
//         _key: `block-${index}`,
//         _type: 'block',
//         style: style,
//         children: children,
//         markDefs: markDefs
//       };
//     }

//     // --- CASE B: LISTS (Bullet & Numbered) ---
//     if (block.type === 'list') {
//       const listItemType = block.tag === 'ol' ? 'number' : 'bullet';
      
//       // Payload list ko 'listitem' children mein bhejta hai
//       return block.children?.map((listItem: any, liIndex: number) => {
//         const markDefs: any[] = [];
//         const children = mapChildrenToSpans(listItem.children, markDefs);

//         return {
//           _key: `list-${index}-${liIndex}`,
//           _type: 'block',
//           style: 'normal',
//           listItem: listItemType, // Ye batata hai ke ye list item hai
//           level: 1, // Nesting level (filhal 1 rakha hai)
//           children: children,
//           markDefs: markDefs
//         };
//       }) || [];
//     }

//     // --- CASE C: UPLOADS (Images) ---
//     if (block.type === 'upload' && block.value && block.value.url) {
//       return {
//         _key: `image-${index}`,
//         _type: 'image',
//         asset: {
//           _ref: block.value.id,
//           _type: 'reference'
//         },
//         // Ye URL humne frontend helper ke liye pass kiya hai
//         url: block.value.url 
//       } as SanityImageObject;
//     }

//     // --- CASE D: FALLBACK (Unknown Blocks) ---
//     // Agar koi aisi cheez aa gayi jo hum nahi jante, usay text bana do taake crash na ho
//     return {
//         _key: `fallback-${index}`,
//         _type: 'block',
//         style: 'normal',
//         children: [{ 
//             _key: `span-${index}`, 
//             _type: 'span', 
//             text:  '', 
//             marks: [] 
//         }]
//     };
//   });
// };
import { SanityImageObject } from "@/types";

// --- TEXT FORMATTING CONSTANTS ---
const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_STRIKETHROUGH = 4;
const IS_UNDERLINE = 8;
const IS_CODE = 16;
const IS_SUBSCRIPT = 32;
const IS_SUPERSCRIPT = 64;

// ✅ FIX 1: Stable key generator (no hydration mismatch)
let keyCounter = 0;
const generateKey = () => `key-${++keyCounter}`;

// ✅ FIX 2: Proper types
interface LexicalChild {
  type?: 'text' | 'link' | 'upload';
  text?: string;
  format?: number;
  fields?: { url?: string };
  url?: string;
  children?: LexicalChild[];
  value?: { url?: string; id?: string };
  tag?: string;
}

interface LexicalBlock {
  type?: 'paragraph' | 'heading' | 'list' | 'upload' | 'quote';
  children?: LexicalChild[];
  tag?: string;
  value?: { url?: string; id?: string };
}

interface LexicalData {
  root?: {
    children?: LexicalBlock[];
  };
}

// --- RECURSIVE CHILD MAPPER ---
const mapChildrenToSpans = (
  children: LexicalChild[] | undefined,
  markDefs: any[]
) => {
  if (!children) return [];

  return children.flatMap((child: LexicalChild) => {
    // 1. Simple text
    if (child.type === 'text') {
      const marks = [];
      if (child.format && (child.format & IS_BOLD)) marks.push('strong');
      if (child.format && (child.format & IS_ITALIC)) marks.push('em');
      if (child.format && (child.format & IS_STRIKETHROUGH)) marks.push('strike-through');
      if (child.format && (child.format & IS_UNDERLINE)) marks.push('underline');
      if (child.format && (child.format & IS_CODE)) marks.push('code');

      return {
        _type: 'span',
        _key: generateKey(), // ✅ FIX: Stable key
        text: child.text || '',
        marks: marks
      };
    }

    // 2. Link
    if (child.type === 'link') {
      const linkKey = generateKey();
      
      markDefs.push({
        _key: linkKey,
        _type: 'link',
        href: child.fields?.url || child.url || '#',
      });

      return (child.children || []).map((grandChild: LexicalChild) => ({
        _type: 'span',
        _key: generateKey(),
        text: grandChild.text || '',
        marks: [linkKey]
      }));
    }

    return [];
  });
};

// --- 🔥 THE MASTER CONVERTER ---
export const lexicalToPortableText = (lexicalData: LexicalData | null | undefined) => {
  if (!lexicalData?.root?.children) return null;

  return lexicalData.root.children.flatMap((block: LexicalBlock, index: number) => {
    
    // --- CASE A: HEADINGS & PARAGRAPHS ---
    if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote') {
      let style = 'normal';
      if (block.tag === 'h1') style = 'h1';
      if (block.tag === 'h2') style = 'h2';
      if (block.tag === 'h3') style = 'h3';
      if (block.tag === 'h4') style = 'h4';
      if (block.tag === 'h5') style = 'h5';
      if (block.tag === 'h6') style = 'h6';
      if (block.type === 'quote') style = 'blockquote';

      const markDefs: any[] = [];
      const children = mapChildrenToSpans(block.children, markDefs);

      if (children.length === 0) return [];

      return {
        _key: `block-${index}`,
        _type: 'block',
        style: style,
        children: children,
        markDefs: markDefs
      };
    }

    // --- CASE B: LISTS ---
    if (block.type === 'list') {
      const listItemType = block.tag === 'ol' ? 'number' : 'bullet';
      
      return block.children?.map((listItem: LexicalChild, liIndex: number) => {
        const markDefs: any[] = [];
        const children = mapChildrenToSpans(listItem.children, markDefs);

        return {
          _key: `list-${index}-${liIndex}`,
          _type: 'block',
          style: 'normal',
          listItem: listItemType,
          level: 1,
          children: children,
          markDefs: markDefs
        };
      }) || [];
    }

    // --- CASE C: IMAGES ---
    if (block.type === 'upload' && block.value?.url) {
      return {
        _key: `image-${index}`,
        _type: 'image',
        asset: {
          _ref: block.value.id || `img-${index}`,
          _type: 'reference'
        },
        url: block.value.url 
      } as SanityImageObject;
    }

    // --- CASE D: FALLBACK ---
    return {
        _key: `fallback-${index}`,
        _type: 'block',
        style: 'normal',
        children: [{ 
            _key: `span-${index}`, 
            _type: 'span', 
            text:  '', 
            marks: [] 
        }]
    };
  });
};