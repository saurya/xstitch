import webapp2
import os
import models
from google.appengine.ext import db
from google.appengine.ext.webapp import template

class SaveHandler(webapp2.RequestHandler):
    def post(self):
        # Convert the JSON object to python representation
        # Put it in the datastore. 
        key = self.request.get("name")
        pattern = models.Pattern(key_name=key) 
        pattern.stack = self.request.get("stack")
        if models.Pattern.all().filter('__key__ = ', db.Key.from_path('Pattern', key)).get() :
            self.response.out.write('Name is taken, please choose a different name!')
            return
        pattern.put()
        self.response.out.write('Saved!')

app = webapp2.WSGIApplication([
    ('/save', SaveHandler)
], debug=True)
