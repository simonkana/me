---
layout: home
title: Home
---
<section class="hero wrap">
  <div class="hero-copy">
    <p class="eyebrow">{{ site.data.profile.location }}</p>
    <h1>I write software.<br>I make images.<br><em>I go climbing.</em></h1>
    <p class="hero-intro">{{ site.data.profile.intro }}</p>
    <div class="hero-links">
      <a class="text-link" href="#work">A few things I’ve made <span aria-hidden="true">↓</span></a>
      <a class="text-link text-link-quiet" href="{{ '/about/' | relative_url }}">About me <span aria-hidden="true">↗</span></a>
    </div>
  </div>
  <figure class="hero-photo">
    <img src="{{ '/assets/me.jpg' | relative_url }}" alt="Šimon sitting outdoors at sunset with a backpack" fetchpriority="high">
  </figure>
</section>

{% assign projects = site.work | sort: 'order' %}
<section class="section work-section" id="work">
  <div class="wrap">
    <div class="section-heading">
      <div><p class="eyebrow">Selected projects</p><h2>Work</h2></div>
    </div>
    <div class="work-list">
      {% for project in projects %}
      <a class="work-card{% if project.image %} work-card-with-image{% endif %}" href="{{ project.url | relative_url }}">
        <span class="work-card-index">{{ forloop.index | prepend: '0' }}</span>
        <div class="work-card-copy">
          <p class="work-kicker">{{ project.category }}{% if project.year %}<span> · </span>{{ project.year }}{% endif %}</p>
          <h3>{{ project.title }}</h3>
          <p class="work-description">{{ project.description }}</p>
        </div>
        {% if project.image %}<img class="work-thumbnail" src="{{ project.image | relative_url }}" alt="{{ project.image_alt | default: project.title }}">{% endif %}
        <span class="work-arrow" aria-hidden="true">↗</span>
      </a>
      {% endfor %}
      {% if projects.size == 0 %}<p class="empty-note">I’m putting together a few projects to share here.</p>{% endif %}
    </div>
  </div>
</section>

<section class="section journal-section" id="journal">
  <div class="wrap">
    <div class="section-heading">
      <div><p class="eyebrow">Occasional notes</p><h2>Journal</h2></div>
      <a class="text-link" href="{{ '/feed.xml' | relative_url }}">RSS <span aria-hidden="true">↗</span></a>
    </div>
    <div class="journal-list">
      {% for post in site.posts limit:4 %}
      <a class="journal-row" href="{{ post.url | relative_url }}"><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %-d, %Y" }}</time><span class="journal-title">{{ post.title }}</span><span class="journal-arrow" aria-hidden="true">↗</span></a>
      {% endfor %}
      {% if site.posts.size == 0 %}<p class="empty-note">Notes on making things, and everything around them.</p>{% endif %}
    </div>
  </div>
</section>

<section class="contact-section wrap">
  <p class="eyebrow">Email</p>
  <div class="contact-row">
    <h2>Want to talk?</h2>
    <a class="contact-link" href="mailto:{{ site.email }}">Send me a note <span aria-hidden="true">↗</span></a>
  </div>
</section>
