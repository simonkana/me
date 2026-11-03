---
layout: home
title: "I build software. I play music and climb."
browser_title: "I build software. I play music and climb."
description: "Freelance software engineer in Prague; guitar, singing, climbing, and first experiments with iPhone photography and filmmaking."
image: /assets/me.jpg
---
<section class="hero wrap" aria-labelledby="intro-title">
  <div class="hero-copy">
    <h1 id="intro-title">I build software.<br><em>I play music &amp; climb.</em></h1>
    <p class="hero-intro">{{ site.data.profile.intro }}</p>
    <div class="hero-links">
      <a class="button-link" href="#work">Have a look around <span aria-hidden="true">→</span></a>
      <a class="text-link" href="{{ '/about/' | relative_url }}">A little about me <span aria-hidden="true">↗</span></a>
    </div>
  </div>
  <figure class="hero-photo">
    <img src="{{ '/assets/me.jpg' | relative_url }}" alt="Šimon sitting outdoors at sunset with a backpack" fetchpriority="high">
  </figure>
</section>

<section class="section work-section" id="work" aria-labelledby="work-title">
  <div class="wrap">
    <div class="section-heading">
      <div><p class="eyebrow">01 <span class="eyebrow-slash">/</span> Software</p><h2 id="work-title">Projects</h2></div>
    </div>
    <div class="work-grid">
      <p class="empty-note">I’m getting a few projects ready to share here. Check back soon.</p>
    </div>
  </div>
</section>

<section class="section photographs-section" id="photographs" aria-labelledby="photographs-title">
  <div class="wrap">
    <div class="section-heading">
      <div><p class="eyebrow">02 <span class="eyebrow-slash">/</span> A few frames</p><h2 id="photographs-title">Photographs</h2></div>
      <a class="text-link" href="{{ '/photographs/' | relative_url }}">Visit the gallery <span aria-hidden="true">↗</span></a>
    </div>
    <div class="photo-grid photo-grid-preview">
      {% for photo in site.data.photographs limit:3 %}
      <a class="photo-card" href="{{ '/photographs/' | relative_url }}" aria-label="View the photograph gallery: {{ photo.title | escape }}">
        <img src="{{ photo.image | relative_url }}" alt="{{ photo.alt | escape }}"{% if photo.width and photo.height %} width="{{ photo.width }}" height="{{ photo.height }}"{% endif %} loading="lazy" decoding="async">
        <span class="photo-card-caption"><span class="photo-card-title">{{ photo.title }}</span></span>
      </a>
      {% endfor %}
    </div>
  </div>
</section>

<section class="section journal-section" id="journal" aria-labelledby="journal-title">
  <div class="wrap">
    <div class="section-heading">
      <div><p class="eyebrow">03 <span class="eyebrow-slash">/</span> Notes &amp; observations</p><h2 id="journal-title">Notebook</h2></div>
      <a class="text-link" href="{{ '/feed.xml' | relative_url }}">RSS <span aria-hidden="true">↗</span></a>
    </div>
    <div class="journal-list">
      {% for post in site.posts limit:4 %}
      <a class="journal-row" href="{{ post.url | relative_url }}"><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %-d, %Y" }}</time><span class="journal-title">{{ post.title }}</span><span class="journal-arrow" aria-hidden="true">↗</span></a>
      {% endfor %}
      {% if site.posts.size == 0 %}<p class="empty-note">No notes yet. The notebook can wait.</p>{% endif %}
    </div>
  </div>
</section>

<section class="contact-section wrap" aria-labelledby="contact-title">
  <div class="contact-card">
    <p class="eyebrow">Have a project in mind?</p>
    <div class="contact-row">
      <h2 id="contact-title">Say hello.</h2>
      <div class="contact-links">
        <a class="button-link button-link-ink" href="mailto:{{ site.email }}">Email me <span aria-hidden="true">↗</span></a>
        <a class="contact-social" href="{{ site.data.profile.github_url }}">GitHub <span aria-hidden="true">↗</span></a>
        {% if site.data.profile.youtube_url and site.data.profile.youtube_url != "" %}<a class="contact-social" href="{{ site.data.profile.youtube_url }}">YouTube <span aria-hidden="true">↗</span></a>{% endif %}
      </div>
    </div>
  </div>
</section>
