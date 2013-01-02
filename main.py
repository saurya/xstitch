import webapp2
import os
import models
from google.appengine.ext import db
from google.appengine.ext.webapp import template

class MainHandler(webapp2.RequestHandler):
    def get(self):
        path = self.request.path
        loadedStack = '[]'
        loadState = 'false'
        if len(path) > 1:
            key = db.Key.from_path('Pattern', path[1:])
            pattern = models.Pattern.all().filter('__key__ =', key).get()
            if pattern:
                loadState = 'true'
                loadedStack = pattern.stack
        template_values = { 'loadState' : loadState, 'stack' : loadedStack }
        path = os.path.join(os.path.dirname(__file__), 'cross.html')
        self.response.out.write(template.render(path, template_values))

# TODO (saurya): Make a separate handler for / and /.*
app = webapp2.WSGIApplication([
    ('/.*', MainHandler)
], debug=True)
