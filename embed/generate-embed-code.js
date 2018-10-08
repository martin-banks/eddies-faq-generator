// const template = inner => `<div id="dna-generated-faq-embed">${inner}</div>`


// this is the embed code returned to the user
<div id="dna-generated-faq-embed">
  <script src="path/to/uploaded/file.js"></script>
</div>


// This is the content of the script linked in the embed
const unique_FAQ_name = '[taken from downloaded zip]'
document.querySelector('#dna-generated-faq-embed').innerHTML = unique_FAQ_name
