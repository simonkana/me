---
layout: cv
title: CV
description: "CV of Šimon Káňa, freelance software engineer in Prague."
image: /assets/me.jpg
permalink: /cv/
---
<div class="cv-columns">
  <div class="cv-main-column">
    <section class="cv-section">
      <h2>Profile</h2>
      <p>Freelance software engineer based in Prague.</p>
    </section>

    <section class="cv-section">
      <h2>Current work</h2>
      <div class="cv-entry">
        <div class="cv-entry-heading">
          <h3>Freelance software engineer</h3>
          <span>Current</span>
        </div>
        <p>Independent</p>
      </div>
    </section>

    {% assign cv_projects = site.work | where_exp: "project", "project.template != true" | sort: "order" %}
    <section class="cv-section">
      <h2>Selected projects</h2>
      {% if cv_projects.size > 0 %}
      <ul class="cv-project-list">
        {% for project in cv_projects %}
        <li><a href="{{ project.url | relative_url }}">{{ project.title }}</a><span>{{ project.category }}{% if project.year %} · {{ project.year }}{% endif %}</span><p>{{ project.description }}</p></li>
        {% endfor %}
      </ul>
      {% else %}
      <p class="cv-note">Selected projects will appear here as they’re added to the Work page.</p>
      {% endif %}
    </section>
  </div>

  <aside class="cv-side-column">
    <section class="cv-section">
      <h2>Interests</h2>
      <ul>
        <li>Music: guitar and singing</li>
        <li>Climbing, indoors and outdoors</li>
        <li>Beginning photography, videography, and cinematography with an iPhone 11 and Blackmagic Camera app</li>
        <li>Nature</li>
      </ul>
    </section>
    <section class="cv-section cv-side-note">
      <h2>Elsewhere</h2>
      <p>For more about me and what I’m making, <a href="{{ '/' | relative_url }}">visit my website</a>.</p>
    </section>
  </aside>
</div>
