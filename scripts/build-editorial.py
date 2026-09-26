"""Render the static portfolio from shared, editable project data. No runtime framework."""
from pathlib import Path
from html import escape
import json, re

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = json.loads((ROOT / 'data/projects.json').read_text())
BY_SLUG = {p['slug']: p for p in PROJECTS}
ORIGIN = 'https://ajakweb.vercel.app'
WA = 'https://wa.me/60176146502?text=Hi%20ajak.Web%2C%20I%27d%20like%20to%20discuss%20a%20website%20for%20my%20business.'
e = escape

def root_links(markup):
    return re.sub(r'(href|src)="(?!https?:|mailto:|tel:|#|/)([^"\s]+)"', r'\1="/\2"', markup)

def photo(im, eager=False, sizes='(max-width: 700px) 100vw, 80vw'):
    src=im['src']; attrs=''
    if im.get('responsive'):
        src=im['responsive'][-1]['src']
        attrs=' srcset="'+', '.join('/'+r['src']+' '+str(r['width'])+'w' for r in im['responsive'])+'" sizes="'+sizes+'"'
    return f'<img src="/{src}"{attrs} width="{im["width"]}" height="{im["height"]}" alt="{e(im["alt"])}" loading="{"eager" if eager else "lazy"}" decoding="async"'+(' fetchpriority="high"' if eager else '')+'>'

def link(text, href, cls='ed-link', external=False):
    return f'<a class="{cls}" href="{e(href)}"'+(' target="_blank" rel="noopener noreferrer"' if external else '')+f'>{text}<span aria-hidden="true">{"↗" if external else "→"}</span></a>'

def label(num,text): return f'<p class="ed-label"><span>{num}</span>{text}</p>'

def closing():
    return f'''<section class="ed-closing"><div class="ed-wrap">
      {label('Next chapter','Your business, online')}
      <h2>Let’s make<br><em>something useful.</em></h2>
      <div class="ed-closing-bottom"><p>A new website. A fresh direction.<br>It starts with a conversation.</p>{link('Let’s talk on WhatsApp',WA,'ed-cta',True)}</div>
    </div></section>'''

def footer():
    return '''<footer class="site-footer ed-footer"><div class="ed-wrap">
      <div class="ed-footer-top"><a class="brand" href="/index.html">ajak<span class="brand__dot">.</span>Web</a><p>Independent web design.<br>Petaling Jaya, Malaysia.</p>
      <nav aria-label="Footer"><a href="/about.html">About</a><a href="/services.html">Services</a><a href="/work.html">Work</a><a href="/contact.html">Contact</a></nav>
      <div><a href="mailto:ajakrzzq@gmail.com">ajakrzzq@gmail.com</a><a href="https://wa.me/60176146502" target="_blank" rel="noopener">+60 17-614 6502 ↗</a><a href="https://www.linkedin.com/in/ajakrzzq" target="_blank" rel="noopener">LinkedIn ↗</a></div></div>
      <div class="ed-footer-bottom"><span>© <span id="year">2026</span> ajak.Web</span><span>Designed & built by ajak.Web</span><a href="#main">Back to top ↑</a></div></div></footer>'''

def write_page(file, key, content, case=None):
    head=(ROOT/f'templates/{key}-head.html').read_text()
    if case:
        title=case['name']+' — Concept Website | ajak.Web'
        desc=case['overview']; url=ORIGIN+'/'+file.replace('index.html','')
        head=re.sub(r'<title>.*?</title>',f'<title>{e(title)}</title>',head)
        head=re.sub(r'(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*',lambda m:m[1]+e(desc),head)
        head=re.sub(r'(<meta (?:name|property)="(?:og:title|twitter:title)" content=")[^"]*',lambda m:m[1]+e(title),head)
        head=re.sub(r'(<link rel="canonical" href=")[^"]*',lambda m:m[1]+url,head)
        head=re.sub(r'(<meta property="og:url" content=")[^"]*',lambda m:m[1]+url,head)
        head=re.sub(r'(<meta (?:name|property)="(?:og:image|twitter:image)" content=")[^"]*',lambda m:m[1]+ORIGIN+'/'+case['images'][0]['src'],head)
    nav=(ROOT/'templates/navigation.html').read_text()
    nav=nav.replace(' aria-current="page"','')
    nav=nav.replace(f'href="{key}.html"',f'href="{key}.html" aria-current="page"')
    # Closed mobile links must be unavailable to keyboard and screen readers.
    nav=nav.replace('id="mobile-menu"','id="mobile-menu" inert')
    head=root_links(head)
    head += '\n<link rel="stylesheet" href="/css/editorial.css?v=4">\n'
    body=f'''<!DOCTYPE html><html lang="en"><head>{head}</head>
<body class="editorial ed-{key}"><a class="skip-link" href="#main">Skip to content</a>{root_links(nav)}
<main id="main" tabindex="-1">{content}</main>{footer()}
<script src="/js/script.js" defer></script><script src="/js/editorial.js" defer></script></body></html>'''
    target=ROOT/file;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(body)

def featured(slug,num,cls=''):
    p=BY_SLUG[slug]
    return f'''<article class="ed-feature {cls}" data-reveal>
      <a class="ed-feature-image" href="/work/{slug}/" aria-label="View {e(p['name'])} case study">{photo(p['images'][0])}<span class="ed-image-action" aria-hidden="true">View project ↗</span></a>
      <div class="ed-feature-meta"><span>{num} / {' + '.join(p['categories'])}</span><span>Concept website</span></div>
      <div class="ed-feature-title"><h3><a href="/work/{slug}/">{e(p['name'])}</a></h3><span aria-hidden="true">↗</span></div><p>{e(p['one_line'])}</p></article>'''

def process():
    steps=[('Consultation','Your business, audience and goals.'),('Planning','The pages, content and customer journey.'),('Design','A visual direction shaped around your brand.'),('Development','Responsive layouts and working interactions.'),('Launch','Final checks, handover and going live.')]
    return '<ol class="ed-process">'+''.join(f'<li><span class="ed-num">0{i+1}</span><h3>{a}</h3><p>{b}</p></li>' for i,(a,b) in enumerate(steps))+'</ol>'

def home():
    content=f'''<section class="ed-hero ed-wrap">
      <div class="ed-issue"><span>Independent web design & development</span><span>Petaling Jaya / Malaysia</span></div>
      <div class="ed-hero-grid"><div class="ed-hero-copy">
      <p class="ed-label">For the businesses building something.</p>
      <h1>YOUR BUSINESS.<br>ONLINE,<br><span>PROPERLY.</span></h1>
      <div class="ed-hero-bottom"><p>Thoughtfully designed websites for Malaysian businesses. Clear, practical, and made to feel like you.</p>
      <div class="ed-actions">{link('Let’s talk',WA,'ed-cta',True)}{link('View my work','/work.html')}</div></div></div>
      <figure class="ed-portrait"><img src="/images/hero/editorial-portrait.webp" width="1154" height="1536" alt="Ajak, independent web designer based in Petaling Jaya" fetchpriority="high"><figcaption><span>Behind ajak.Web</span><a href="/about.html">Meet the designer ↗</a></figcaption><span class="ed-portrait-tag" aria-hidden="true">Good design.<br>Direct conversation.</span></figure></div>
      <div class="ed-hero-note"><span>01 — The studio</span><p>Every business is different.<br>Its website should be too.</p><a href="#selected">Explore the work ↓</a></div>
    </section>
    <section class="ed-section ed-wrap" id="selected"><div class="ed-section-head">{label('02','Selected work')}<h2>A few different<br><em>points of view.</em></h2><p>Independent concepts exploring what a website can do for a business.</p></div>
    <div class="ed-selected">{featured('jovi','01','ed-feature-lead')}{featured('safwa-umrah','02','ed-feature-offset')}{featured('madani','03','ed-feature-wide')}{featured('klinik-ceria','04','ed-feature-small')}</div>
    <div class="ed-section-end"><span>Four features. More inside.</span>{link('Open the project archive','/work.html')}</div></section>
    <section class="ed-services-intro ed-section"><div class="ed-wrap ed-two-col"><div>{label('03','What I do')}<h2>Useful by design.<br><em>Distinct by nature.</em></h2><p>A clear website helps people understand your business and take the next step.</p>{link('Explore the services','/services.html')}</div>
    <ol class="ed-service-list">'''
    for i,(title,desc) in enumerate([('Website Design','A visual identity and layout that belong to your business.'),('Business Websites','The right pages, information and enquiry journey.'),('Website Redesign','A fresh direction for a website you already have.'),('Responsive Development','A considered experience across phones, tablets and desktops.')]):
        content+=f'<li><span>0{i+1}</span><div><h3>{title}</h3><p>{desc}</p></div></li>'
    content+=f'''</ol></div></section><section class="ed-section ed-wrap"><div class="ed-section-head">{label('04','The process')}<h2>From first hello<br><em>to out in the world.</em></h2></div>{process()}</section>
    <section class="ed-profile ed-wrap"><div>{label('05','Why ajak.Web')}<h2>Small studio.<br><em>Personal attention.</em></h2></div><div><p class="ed-lead">You talk to the person designing your website. From the first idea to the final detail.</p><p>I’m Ajak, an independent web designer in Petaling Jaya. I work with Malaysian business owners to make their websites easier to understand, easier to use, and unmistakably theirs.</p>{link('A little more about me','/about.html')}</div></section>
    <section class="ed-section ed-wrap"><div class="ed-archive-intro">{label('06','Inside the archive')}<h2>More to discover.</h2>{link('All 10 projects','/work.html')}</div><div class="ed-mini-index">'''
    for slug in ['novae','kings-hall','royale-chesterfield','lumiere']:
        p=BY_SLUG[slug];content+=f'<a href="/work/{slug}/"><span>{e(p["name"])}</span><span>{e(p["categories"][0])}</span><span aria-hidden="true">↗</span></a>'
    write_page('index.html','index',content+'</div></section>'+closing())

def archive():
    cats=list(dict.fromkeys(c for p in PROJECTS for c in p['categories']))
    content=f'''<section class="ed-page-intro ed-wrap">{label('The collection','10 independent concepts')}<div class="ed-archive-title"><h1>WORK<span class="ed-count">(10)</span></h1><p>A collection of different businesses,<br>different stories, different possibilities.</p></div><p class="ed-archive-note">Concept projects by ajak.Web. Explore the idea, see the design, try the demo.</p></section>
    <section class="ed-wrap ed-archive-section" aria-label="Project archive">
    <div class="ed-archive-tools" data-archive-controls hidden><div class="ed-filters" role="group" aria-label="Filter projects by industry"><button type="button" data-filter="all" aria-pressed="true">All <span>10</span></button>'''
    content+=''.join(f'<button type="button" data-filter="{e(c)}" aria-pressed="false">{e(c)}</button>' for c in cats)
    content+='''</div><div class="ed-view-toggle" role="group" aria-label="Project view"><button type="button" data-view="folders" aria-pressed="true">Folders</button><button type="button" data-view="index" aria-pressed="false">Index</button></div></div><p class="ed-results" role="status" aria-live="polite" aria-atomic="true">10 projects</p><div class="ed-folders" id="project-archive">'''
    for i,p in enumerate(PROJECTS):
        content+=f'''<article class="ed-folder" id="{p['legacy_id']}" data-categories="{e('|'.join(p['categories']))}"><a href="/work/{p['slug']}/" class="ed-folder-link"><span class="ed-folder-tab"><span>PROJECT / {i+1:02}</span><span aria-hidden="true">↗</span></span><div class="ed-folder-image">{photo(p['images'][0],sizes='(max-width: 700px) 100vw, (max-width: 1024px) 50vw, 33vw')}</div><div class="ed-folder-cover"><span class="ed-folder-category">{e(' / '.join(p['categories']))}</span><h2>{e(p['name'])}</h2><div class="ed-folder-foot"><span>Independent concept</span><span>View project ↗</span></div></div></a></article>'''
    content+='</div><noscript><p>All projects are shown. Open a folder to read its case study.</p></noscript></section>'+closing()
    write_page('work.html','work',content)

def case_studies():
    for i,p in enumerate(PROJECTS):
        demo=p['demo'] if p['demo'].startswith('http') else '/'+p['demo']
        content=f'''<article><header class="ed-case-head ed-wrap"><a class="ed-back" href="/work.html">← Project archive</a><div class="ed-case-kicker">{label(f'{i+1:02} / 10','Independent concept')}<span>{e(' / '.join(p['categories']))}</span></div><h1>{e(p['name'])}</h1><div class="ed-case-summary"><p class="ed-lead">{e(p['overview'])}</p>{link('Open live demo',demo,'ed-link',True)}</div><p class="ed-disclosure">{e(p['disclosure'] or 'An independent concept by ajak.Web, presented as a design exploration rather than commissioned client work.')}</p></header>
        <figure class="ed-case-hero ed-wrap">{photo(p['images'][0],True)}<figcaption><span>01 / Website overview</span><span>{e(p['name'])}</span></figcaption></figure>
        <section class="ed-case-story ed-wrap"><div>{label('The brief','Design with a purpose')}<dl class="ed-facts"><div><dt>Industry</dt><dd>{e(' / '.join(p['categories']))}</dd></div><div><dt>Project type</dt><dd>Independent concept</dd></div><div><dt>Services</dt><dd>Web design · UI/UX · Development</dd></div><div><dt>Built with</dt><dd>HTML, CSS & JavaScript</dd></div></dl></div><div><h2>The challenge</h2><p>{e(p['challenge'])}</p><h2>The design direction</h2><p>{e(p['direction'])}</p></div></section>'''
        if p['features']:
            content+='<section class="ed-case-features ed-wrap">'+label('In the details','What the website does')+'<ul>'+''.join(f'<li><span>{j+1:02}</span>{e(f)}</li>' for j,f in enumerate(p['features']))+'</ul></section>'
        if len(p['images'])>1:
            content+='<section class="ed-case-gallery ed-wrap" aria-label="Project screenshots">'
            for j,im in enumerate(p['images'][1:],2):
                mobile=' ed-shot-mobile' if im['width']<600 else ''
                content+=f'<figure class="ed-shot{mobile}" data-reveal><a href="/{im["src"]}" target="_blank" rel="noopener" aria-label="Open full-size screenshot: {e(im["caption"])}">{photo(im)}</a><figcaption><span>{j:02} / {e(im["caption"])}</span><span>Open full size ↗</span></figcaption></figure>'
            content+='</section>'
        content+=f'<section class="ed-case-purpose ed-wrap">{label("The intention","A practical next step")}<h2>{e(p["one_line"])}</h2><p>This concept demonstrates a design approach. It does not claim measured business results or a client endorsement.</p>{link("Explore the working concept",demo,"ed-link",True)}</section></article>'
        nxt=PROJECTS[(i+1)%len(PROJECTS)]
        content+=f'<aside class="ed-next ed-wrap">{label("Keep exploring","Next project")}<a href="/work/{nxt["slug"]}/">{e(nxt["name"])}<span aria-hidden="true">↗</span></a></aside>'
        write_page(f'work/{p["slug"]}/index.html','work',content,p)

def about():
    content=f'''<section class="ed-page-intro ed-wrap">{label('The person behind the work','About ajak.Web')}<h1>ONE DESIGNER.<br><em>YOUR NEXT CHAPTER.</em></h1></section>
    <section class="ed-about ed-wrap"><figure><img src="/images/hero/editorial-portrait.webp" width="1154" height="1536" alt="Ajak, founder of ajak.Web" fetchpriority="high"><figcaption>Ajak / Founder & web designer</figcaption></figure><div><p class="ed-label">Hello, I’m Ajak.</p><h2>Good websites start<br><em>with understanding.</em></h2><p class="ed-lead">I help Malaysian businesses create a professional online presence through modern, practical website design.</p><p>Based in Petaling Jaya, I work directly with business owners from planning to launch. We start with what you do, who your customers are, and what they need to find.</p><p>That understanding shapes the structure, the visual direction and the details. The aim is a website that feels like your business and makes the next step clear.</p><dl class="ed-facts"><div><dt>Based in</dt><dd>Petaling Jaya, Selangor</dd></div><div><dt>Working with</dt><dd>Malaysian small & medium businesses</dd></div><div><dt>Speciality</dt><dd>Business websites & redesigns</dd></div><div><dt>Communication</dt><dd>Directly with the designer</dd></div></dl></div></section>
    <section class="ed-section ed-wrap"><div class="ed-section-head">{label('The philosophy','A few things I believe')}<h2>A website should<br><em>earn its place.</em></h2></div><div class="ed-beliefs"><div><span>01</span><h3>Start with the business.</h3><p>A restaurant, a clinic and a furniture maker have different stories. Their websites should reflect that.</p></div><div><span>02</span><h3>Make it easy to use.</h3><p>Clear information, thoughtful mobile layouts and a simple way to get in touch.</p></div><div><span>03</span><h3>Keep it personal.</h3><p>Direct conversation, practical advice and attention from the first idea to launch.</p></div></div></section>
    <section class="ed-section ed-wrap"><div class="ed-section-head">{label('Working together','From idea to launch')}<h2>A clear process.</h2></div>{process()}</section>'''+closing()
    write_page('about.html','about',content)

def services():
    rows=[('Business Website','A professional home for your business.','For local businesses, startups and service providers.',['Home, About, Services and Contact pages','Contact and WhatsApp enquiry paths','Responsive layouts','Basic on-page SEO structure'],'klinik-ceria'),('Restaurant & Food Website','Bring the experience to the table.','For cafés, restaurants and food businesses.',['Menu and signature products','Brand story and photography','Location and opening hours','WhatsApp enquiries and reservations'],'chicken-rice-syukran'),('Corporate Website','Present your capabilities with clarity.','For companies with services, projects and industry expertise.',['Company profile and services','Projects and industries','Product information','Clear contact details and enquiries'],'madani'),('Landing Page','One page. A focused purpose.','For a launch, a promotion or a single service.',['A layout built around one goal','Clear calls to action','WhatsApp or contact links','Responsive design'],'atelier-miette'),('Website Redesign','A fresh point of view.','For a business whose website no longer fits.',['Modern visual direction','Better mobile experience','Clearer information and navigation','Stronger enquiry paths'],'jovi')]
    content=f'''<section class="ed-page-intro ed-wrap">{label('The service catalogue','Design / Development')}<h1>MADE FOR<br><em>YOUR BUSINESS.</em></h1><p class="ed-lead">From your first website to a fresh direction.<br>Thoughtfully designed around what you need.</p></section><section class="ed-wrap ed-catalogue" aria-label="Website services">'''
    for i,(name,title,desc,features,slug) in enumerate(rows):
        content+=f'<article class="ed-catalogue-row"><span class="ed-num">0{i+1}</span><div><h2>{name}</h2><p>{title}</p></div><div><p>{desc}</p><ul>'+''.join(f'<li>{x}</li>' for x in features)+f'</ul>{link("See a concept → "+e(BY_SLUG[slug]["name"]),"/work/"+slug+"/")}</div></article>'
    content+=f'''</section><section class="ed-service-scope ed-wrap">{label('The right fit','Scope before price')}<div><h2>Let’s start with<br><em>what you need.</em></h2><p>Tell me about your business, the pages you have in mind and any features you need. I’ll recommend an approach and confirm the scope and price before work starts.</p>{link('Discuss your project',WA,'ed-cta',True)}</div></section><section class="ed-section ed-wrap"><div class="ed-section-head">{label('The process','A clear path forward')}<h2>From conversation<br><em>to launch.</em></h2></div>{process()}</section>'''+closing()
    write_page('services.html','services',content)

def contact():
    form=(ROOT/'templates/contact-form.html').read_text().replace(' novalidate','').replace('Send Enquiry','Prepare WhatsApp enquiry')
    form=form.replace('class="btn btn--accent btn--block"','class="ed-cta ed-form-submit"').replace('type="submit"','type="submit" disabled data-enquiry-submit')
    content=f'''<section class="ed-page-intro ed-wrap">{label('Let’s talk','Your next chapter starts here')}<h1>LET’S BUILD<br><em>SOMETHING USEFUL.</em></h1></section>
    <section class="ed-contact ed-wrap"><div><p class="ed-lead">Tell me about your business.<br>We’ll work out the next step together.</p>{link('WhatsApp Ajak',WA,'ed-contact-primary',True)}<p class="ed-contact-number">+60 17-614 6502</p><dl class="ed-facts"><div><dt>Prefer email?</dt><dd><a href="mailto:ajakrzzq@gmail.com">ajakrzzq@gmail.com</a></dd></div><div><dt>Based in</dt><dd>Petaling Jaya, Selangor, Malaysia</dd></div><div><dt>Connect</dt><dd><a href="https://www.linkedin.com/in/ajakrzzq" target="_blank" rel="noopener">LinkedIn ↗</a></dd></div></dl><p>No pressure to decide on the spot. A conversation is a good place to start.</p></div><div class="ed-enquiry"><h2>A little about your project.</h2><p>Fill in the details below to prepare a WhatsApp message. You can review and send it in WhatsApp.</p>{form}<noscript><p>Please use the WhatsApp or email link to share your enquiry.</p></noscript></div></section>'''
    write_page('contact.html','contact',content)

home();archive();case_studies();about();services();contact()
urls=['/','/about.html','/services.html','/work.html','/contact.html']+['/work/'+p['slug']+'/' for p in PROJECTS]
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>{ORIGIN}{url}</loc></url>\n' for url in urls)+'</urlset>\n')
print(f'Built 5 main pages and {len(PROJECTS)} project case studies.')
