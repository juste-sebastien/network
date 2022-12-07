
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("posts/submit", views.new_post, name="new_post"),
    path("posts/edited", views.edit_post, name="edit_post"),
    path("posts/", views.get_posts, name="get_posts"),
    path("profile/<str:username>", views.profile_page, name="profile_page"),
    path("follow/<str:username>", views.follow, name="follow"),
]
