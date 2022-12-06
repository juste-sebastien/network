
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("posts", views.new_post, name="new_post"),
    path("posts/all_posts", views.all_posts, name="all_post"),
    path("posts/all_posts/<str:name>", views.all_posts_of, name="all_post_of"),
    path("posts/follows", views.posts_follows, name="posts_follows"),
    path("profile/<str:username>", views.profile_page, name="profile_page"),
    path("follow/<str:username>", views.follow, name="follow"),
]
