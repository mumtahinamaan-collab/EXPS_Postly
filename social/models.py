from django.db import models

class User(models.Model):
    id = models.CharField(primary_key=True, max_length=100, editable=False)
    email = models.EmailField()
    full_name = models.CharField(max_length=255)
    username = models.CharField(max_length=150, unique=True)
    bio = models.TextField(default='Hey there! I am using Postly.')
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    cover_photo = models.ImageField(upload_to='cover_photos/', blank=True, null=True)
    location = models.CharField(max_length=255, default='', blank=True)
    followers = models.ManyToManyField('self', symmetrical=False, related_name='followers_of', blank=True)
    following = models.ManyToManyField('self', symmetrical=False, related_name='following_of', blank=True)
    connections = models.ManyToManyField('self', symmetrical=False, related_name='connections_of', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username

    class Meta:
        db_table = 'users'