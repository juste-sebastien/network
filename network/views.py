import json

from datetime import datetime

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt, csrf_protect

from .models import *

from .util import generate_profile_img as generate
from .util import is_in_relation


def index(request):
    return render(request, "network/index.html", {
        "posts": Post.objects.order_by("-timestamp").all(),
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })
        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
@login_required
def new_post(request):
    # Composing a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # 
    data = json.loads(request.body)
    content = data["content"]
    if content == "":
        return JsonResponse({
            "error": "Post must not be empty."
        }, status=400)
    user = User.objects.get(username=request.user)
    user.total_posts += 1
    user.save()
    timestamp = timezone.now()
    like = 0

    post = Post.objects.create(user=user, content=content, timestamp=timestamp, like=like)
    post.save()

    return JsonResponse({"message": "Post created successfully."}, status=201)


def all_posts(request):
    posts = Post.objects.order_by("-timestamp").all().values()

    for post in posts:
        post_user = User.objects.get(id=post["user_id"])
        post["username"] = post_user.username
        post["user_profile_img"] = post_user.img_profile.path
    return JsonResponse([post for post in posts], safe=False)


def all_posts_of(request, name):
    user = User.objects.get(username=name)
    posts = Post.objects.order_by("-timestamp").filter(user_id=user.id).all().values()
    for post in posts:
        post_user = User.objects.get(id=post["user_id"])
        post["username"] = post_user.username
        post["user_profile_img"] = post_user.img_profile.path
    return JsonResponse([post for post in posts], safe=False)


def profile_page(request, username):
    # Check if requested user is registered
    try:
        user_profile = User.objects.get(username=username)
    except User.DoesNotExist as error:
        return JsonResponse({"error": "User's profile not found."}, status=404)
    # Check if request user is registered
    try:
        request_user = User.objects.get(username=request.user)
    except User.DoesNotExist as error:
        return JsonResponse({"error": "Request user not found."}, status=404)

    is_followed = True if is_in_relation(request_user, user_profile) else False
    since = (timezone.now() - user_profile.date_joined).total_seconds() * 1000

    response = {
        'username' : user_profile.username,
        'total_posts' : user_profile.total_posts,
        'following' : user_profile.total_followings,
        'total_followers' : user_profile.total_followers,
        'is_followed' : is_followed,
        'since' : since,
        'requested_by' : request.user.username if request.user.is_authenticated else None,
    }

    return JsonResponse(response, safe=False)


@login_required
def follow(request, username):
    follower = User.objects.get(username=request.user)
    author = User.objects.get(username=username)
    data = json.loads(request.body)
    print(data.get("follow"))
    try: 
        relation = Relationship.objects.get(from_user=follower, to_user=author)
    except Relationship.DoesNotExist:
        relation = Relationship.objects.create(from_user=follower, to_user=author)
    if data.get("follow") is not None:
        if data["follow"]:
            relation.status = RELATIONSHIP_FOLLOWING
            relation.save()
            print(Relationship.objects.all())
            author.total_followers += 1
            print(author.total_followers)
            author.save()
        else:
            relation.status = RELATIONSHIP_NONE
            relation.save()
            print(Relationship.objects.all())
            author.total_followers -= 1
            print(author.total_followers)
            author.save()

    return HttpResponse(status=204)

@login_required
def posts_follows(request):
    user = User.objects.get(username=request.user)
    posts = Post.objects.order_by("-timestamp").all().values()
    follows = []
    for post in posts:
        post_user = User.objects.get(id=post["user_id"])
        if is_in_relation(user, post_user):
            post["username"] = post_user.username
            post["user_profile_img"] = post_user.img_profile.path
            follows.append(post)
    return JsonResponse([post for post in follows], safe=False)
