import webapp2
import os
import models
from google.appengine.ext import db
from google.appengine.ext.webapp import template

class MainHandler(webapp2.RequestHandler):
    def get(self):
        key = db.Key.from_path('Pattern', self.request.path[1:])
        pattern = models.Pattern.all().filter('__key__ =', key).get()
        loadedStack = '[]'
        loadState = 'false'
        if pattern:
            loadState = 'true'
            loadedStack = pattern.stack
        template_values = { 'loadState' : loadState, 'stack' : loadedStack }
        path = os.path.join(os.path.dirname(__file__), 'cross.html')
        self.response.out.write(template.render(path, template_values))

app = webapp2.WSGIApplication([
    ('/.*', MainHandler)
], debug=True)
