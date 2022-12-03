from django.contrib.auth.models import AbstractUser
from django.db import models

from django_countries.fields import CountryField


class User(AbstractUser):
    date_of_birth = models.DateField(blank=True, null=True)
    about = models.TextField(blank=True, null=True)
    country = CountryField(blank=True, null=True)
    img_profile = models.ImageField(default="network/profile_img/default.png", blank=True)

    def __str__(self):
        return f"{self.username}"


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owner")
    timestamp = models.DateTimeField(auto_now_add=True)
    like = models.IntegerField(max_length=None, blank=True)
    content = models.TextField(max_length=500, blank=False)
    likers = models.ManyToManyField(User, blank=True, related_name="likers")

    def __str__(self):
        return f"{self.id}: posted by {self.user.username} the {self.timestamp}"


RELATIONSHIP_FOLLOWING = 1
RELATIONSHIP_BLOCKED = 2
RELATIONSHIP_STATUSES = (
    (RELATIONSHIP_FOLLOWING, 'Following'),
    (RELATIONSHIP_BLOCKED, 'Blocked'),
)

class Relationship(models.Model):
    from_user = models.ForeignKey(User,
                                on_delete=models.CASCADE,
                                related_name='relationships_from')
                                
    to_user = models.ForeignKey(User,
                                on_delete=models.CASCADE,
                                related_name='relationships_to')

    status = models.IntegerField(choices=RELATIONSHIP_STATUSES)

    def __str__(self):
        return f'{self.from_user.username} likes {self.to_user.username}'