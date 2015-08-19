# TumbleSiteJS

TumbleSiteJS is an AngularJS application designed to enable the set-up of a custom portfolio website front-end 
using a Tumblr account as the datasource. This is accomplished through the use of tagging.

Unfortunately, at this time, TumbleSiteJS cannot be used directly in conjunction with Tumblr. It must be set-up using a standard web host. In my particular use case, I was able to set it up on Google App Engine fairly easily.

## Blogging

### Articles

Whenever you have original content that you want to share via your TumbleSiteJS website, use the Tumblr - Text post type. Draft and publish your content as you normally might. Apply the following tags to have that content recognized and parsed by TumbleSiteJS:
* blogpost
* article

### Links

If you have links to offsite content, simply use the Tumblr - Link post type. Copy the link, add a short summary if you want, then by applying the following tags those links will show up as part of your blog roll:
* blogpost
* link

## Portfolio / Projects

### Set-Up

Configuring a portfolio / project is pretty straightforward.

1. On line 3 of the tumbleSite.js file, update the blog name value to match your current Tumblr blog name.
2. On line 4, update filter options list to reflect the type of work that you want viewers to be able to filter by. This includes the title of the filter option as well as the tag value that it will expect from your Tumblr post. These values will appear in a select box on the Portfolio / Projects page.

**Remember, the tag values will need to match the actual tag values you use when creating your Tumblr posts.**

That's it! The rest is all handled by tagging in Tumblr.

### Adding Projects

Using the Tumblr - Photo type, drag and drop whatever images you want into the post and arrange them into the desired order.
From there, all you need to do is tag the content. **ALL** projects that you want to appear must have the **portfolio** tag added to the post. From there, simply add the tags that match the type of project.

For example, in the default Tumblr account used in TumbleSite.js, a website project would have the following tags:

* portfolio
* web design

This means that whenever the select box filter on the Portfolio / Projects page is set to either "All" or "Web Design", the website project would display.

## Hero Images

Setting up hero images is a little more involved, but still relatively simple. If you want to feature a project on the homepage carousel, simply add the following tag in addition to any project specific tags:

* hero-image

Additionally, you'll **need** to add an additional image to that project set that has the caption value set to "#hero-image". This image will be parsed out of the project display by TumbleSiteJS and **only** used in the carousel on the homepage.
