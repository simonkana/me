---
layout: home
title: Home
---
<section class="hero wrap">
  <div class="hero-copy">
    <p class="eyebrow"><span class="status-dot"></span> {{ site.data.profile.location }} <span class="eyebrow-divider">/</span> {{ site.data.profile.availability }}</p>
    <h1>Making things<br>with <em>meaning.</em></h1>
    <p class="hero-intro">{{ site.data.profile.intro }}</p>
    <a class="text-link" href="{{ '/about/' | relative_url }}">A little more about me <span aria-hidden="true">↗</span></a>
  </div>
  <div class="hero-art" role="img" aria-label="Abstract landscape in warm sunset tones">
    <div class="sun"></div><div class="horizon horizon-back"></div><div class="horizon horizon-front"></div>
    <span class="art-caption">Somewhere, outside</span>
    <span class="art-index">50° 05′ N&nbsp; 14° 25′ E</span>
  </div>
  <div class="hero-note"><span>01 / 03</span><span>Engineer&nbsp; · &nbsp;Maker&nbsp; · &nbsp;Explorer</span><span>Scroll to explore ↓</span></div>
</section>

<section class="section work-section" id="work">
  <div class="wrap">
    <div class="section-heading"><div><p class="eyebrow">A few things I’ve made</p><h2>Selected <em>work.</em></h2></div><span class="section-count">01 — 03</span></div>
    <div class="work-grid">
      {% assign projects = site.work | sort: 'order' %}
      {% for project in projects %}
      <a class="work-card work-card-{{ forloop.index }}" href="{{ project.url | relative_url }}">
        <div class="work-visual visual-{{ project.visual }}"><span class="visual-mark">{{ project.mark }}</span><span class="visual-label">{{ project.category }}</span></div>
        <div class="work-meta"><div><h3>{{ project.title }}</h3><p>{{ project.description }}</p></div><span class="card-arrow" aria-hidden="true">↗</span></div>
      </a>
      {% endfor %}
      {% if projects.size == 0 %}<p class="empty-note">Your projects will find a home here. Add a Markdown file to <code>_work/</code> to get started.</p>{% endif %}
    </div>
  </div>
</section>

<section class="section journal-section" id="journal">
  <div class="wrap">
    <div class="section-heading"><div><p class="eyebrow">Notes from along the way</p><h2>The <em>journal.</em></h2></div><a class="text-link" href="{{ '/feed.xml' | relative_url }}">RSS feed <span aria-hidden="true">↗</span></a></div>
    <div class="journal-list">
      {% for post in site.posts limit:4 %}
      <a class="journal-row" href="{{ post.url | relative_url }}"><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %d, %Y" }}</time><span class="journal-title">{{ post.title }}</span><span class="journal-arrow" aria-hidden="true">↗</span></a>
      {% endfor %}
      {% if site.posts.size == 0 %}<p class="empty-note">Small observations, works in progress, and things learned along the way. Add a post to <code>_posts/</code> to begin.</p>{% endif %}
    </div>
  </div>
</section>

<section class="contact-section wrap">
  <p class="eyebrow">Have a good one in mind?</p>
  <h2>Let’s make<br>something <em>matter.</em></h2>
  <a class="button-link" href="mailto:{{ site.email }}">Get in touch <span aria-hidden="true">↗</span></a>
</section>
