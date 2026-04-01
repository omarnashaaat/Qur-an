const fs = require('fs');

const htmlContent = fs.readFileSync('index.html', 'utf8');

// Extract CSS
const cssMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
const css = cssMatch ? cssMatch[1] : '';

// Extract JS
const jsMatch = htmlContent.match(/<script type="module">([\s\S]*?)<\/script>/);
let js = jsMatch ? jsMatch[1] : '';

// Inject missing state and effect for namesOfAllah
const stateInjectionPoint = "const [autoPlayRef, setAutoPlayRef] = useState(false);"; // This might not exist exactly like this.
// Let's find a reliable injection point.
const injectionPoint = "const autoPlayRef = useRef(false);";
const stateInjection = `
            const [namesOfAllah, setNamesOfAllah] = useState([]);

            useEffect(() => {
                fetch('https://api.aladhan.com/v1/asmaAlHusna')
                    .then(r => r.json())
                    .then(d => setNamesOfAllah(d.data))
                    .catch(e => console.error(e));
            }, []);
`;

if (js.includes(injectionPoint)) {
    js = js.replace(injectionPoint, injectionPoint + stateInjection);
} else {
    // Fallback: inject at the beginning of QuranSection
    js = js.replace("const QuranSection = () => {", "const QuranSection = () => {" + stateInjection);
}

// Escape CDATA closing tags if any (unlikely in JS but good practice)
js = js.replace(/]]>/g, ']]]]><![CDATA[>');

const xmlTemplate = `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:version='2' class='v2' expr:dir='data:blog.languageDirection' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
<meta content='width=device-width,initial-scale=1' name='viewport'/>
<title><data:blog.pageTitle/></title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="crossorigin"/>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&amp;family=Amiri:wght@400;700&amp;family=Reem+Kufi:wght@400..900&amp;family=Scheherazade+New:wght@400;700&amp;display=swap" rel="stylesheet"/>
<b:skin><![CDATA[
${css}
/* Blogger Reset */
.section, .widget { margin: 0; padding: 0; }
]]></b:skin>
</head>
<body>
  <b:section class='main' id='main' showaddelement='yes'>
    <b:widget id='HTML1' locked='true' title='Quran App' type='HTML'>
      <b:widget-settings>
        <b:widget-setting name='content'><![CDATA[
           <div id="root"></div>
           <script type="importmap">
            {
              "imports": {
                "react": "https://esm.sh/react@19.0.0",
                "react-dom": "https://esm.sh/react-dom@19.0.0",
                "react-dom/client": "https://esm.sh/react-dom@19.0.0/client",
                "lucide-react": "https://esm.sh/lucide-react@0.460.0",
                "htm": "https://esm.sh/htm@3.1.1"
              }
            }
           </script>
           <script type="module">
           ${js}
           </script>
        ]]></b:widget-setting>
      </b:widget-settings>
      <b:includable id='main'>
        <data:content/>
      </b:includable>
    </b:widget>
  </b:section>
</body>
</html>`;

fs.writeFileSync('full_quran_blogger_template.xml', xmlTemplate);
console.log('Template created successfully.');
