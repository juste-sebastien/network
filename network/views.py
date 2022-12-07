import json

from datetime import datetime

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
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


def get_posts(request):
    # Get request informations
    page_number = int(request.GET.get("page"))
    posts_per_page = int(request.GET.get("perPage"))
    user = request.GET.get("user") or None
    feed = request.GET.get("feed") or None
    posts = Post.objects.order_by("-timestamp").all().values()
    
    try:
        request_user = User.objects.get(username=request.user)
    except User.DoesNotExist:
        request_user = None

    # Formate post with informations
    if feed: 
        follows = []
        for post in posts:
            current_post = Post.objects.get(id=post["id"])
            post_user = User.objects.get(id=post["user_id"])
            if request.user != None and is_in_relation(request_user, post_user):
                post["username"] = post_user.username
                post["user_profile_img"] = post_user.img_profile.path
                post["since"] = (timezone.now() - post["timestamp"]).total_seconds() * 1000
                post["is_liker"] = True if post["like"] !=0 and request_user in current_post.likers.all() else False
                follows.append(post)
        posts = follows
    else:
        if user:
            user_profile = User.objects.get(username=user)
            posts = posts.filter(user_id=user_profile.id)

        for post in posts:
            current_post = Post.objects.get(id=post["id"])
            post_user = User.objects.get(id=post["user_id"])
            post["username"] = post_user.username
            post["user_profile_img"] = post_user.img_profile.path
            post["since"] = (timezone.now() - post["timestamp"]).total_seconds() * 1000
            post["is_liker"] = True if post["like"] !=0 and request_user in current_post.likers.all() else False

    # Etablish pagination
    paginator = Paginator(posts, posts_per_page)
    page = paginator.get_page(page_number)

    # Create response 
    response = {
        "requested_by" : request.user.username,
        "page" : page_number,
        "page_count" : paginator.num_pages,
        "next_page" : page.has_next(),
        "previous_page" : page.has_previous(),
        "posts" : [post for post in page.object_list],
    }

    return JsonResponse(response, status=200)


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
        'is_authenticated': True if request.user.is_authenticated else False,
        'is_request_user': True if request.user == user_profile.username else False,
        'since' : since,
        'requested_by' : request.user.username if request.user.is_authenticated else None,
    }

    return JsonResponse(response, safe=False)


@login_required
def follow(request, username):
    follower = User.objects.get(username=request.user)
    author = User.objects.get(username=username)
    data = json.loads(request.body)
    try: 
        relation = Relationship.objects.get(from_user=follower, to_user=author)
    except Relationship.DoesNotExist:
        relation = Relationship.objects.create(from_user=follower, to_user=author)
    if data.get("follow") is not None:
        if data["follow"]:
            relation.status = RELATIONSHIP_FOLLOWING
            relation.save()
            is_followed = True
            author.total_followers += 1
            author.save()
        else:
            relation.status = RELATIONSHIP_NONE
            relation.save()
            is_followed = False
            author.total_followers -= 1
            author.save()

    since = (timezone.now() - author.date_joined).total_seconds() * 1000

    response = {
        'username' : author.username,
        'total_posts' : author.total_posts,
        'following' : author.total_followings,
        'total_followers' : author.total_followers,
        'is_followed' : is_followed,
        'is_authenticated': True if request.user.is_authenticated else False,
        'is_request_user': True if request.user == author.username else False,
        'since' : since,
        'requested_by' : request.user.username if request.user.is_authenticated else None,
    }

    return JsonResponse(response, status=200)


def edit_post(request):
    # Transform request body in Python dict
    data = json.loads(request.body)

    # Get info from data
    post_id = data.get("post_id")
    content = data.get("content")

    # Try to get specific post
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    # Modify content and save post
    post.content = content
    post.save()
    
    return HttpResponse(status=200)
    

def like_post(request):
    # Transform request body in Python dict
    data = json.loads(request.body)

    post_id = data.get("post_id")
    action = data.get("action")

    # Try to get specific post
    try:
        post = Post.objects.get(id=post_id)
        user = User.objects.get(username=request.user)
    except Post.DoesNotExist as post_error:
        return JsonResponse({"error": "Post not found."}, status=404)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)

    # Modify total likes and save post
    if action == 'add':
        post.like += 1
        post.likers.add(user)
    else:
        post.like -= 1
        post.likers.remove(user)
    post.save()
    
    return HttpResponse(status=200)