"""HTTP client for the cluster hermes-memory service (ns hermes-tools).

Pure request/response mapping + a thin urllib caller (stdlib only, so the plugin
never adds a dependency to the installed Hermes runtime). The MemoryProvider
wrapper in __init__.py calls these.
"""
import json
import urllib.error
import urllib.request

DEFAULT_CHAR_LIMIT = 4000

_TRIVIAL = {"", "hi", "hey", "hello", "yes", "no", "ok", "okay", "thanks", "thank you", "yo", "sup"}


def is_trivial(text):
    """Skip recall/persist for greetings / empty / trivial acks (saves a round-trip)."""
    if not text:
        return True
    return text.strip().lower() in _TRIVIAL


def build_recall_body(session_id, query, k=5):
    return {"session_id": session_id, "query": query, "k": int(k)}


def build_remember_body(session_id, user_id, user, assistant):
    return {"session_id": session_id, "user_id": user_id, "user": user, "assistant": assistant}


def format_recall(resp, char_limit=DEFAULT_CHAR_LIMIT):
    """hermes-memory /recall response -> a recall string for prefetch injection.
    Safe on None/failure/empty. Truncates to char_limit."""
    if not isinstance(resp, dict) or not resp.get("ok"):
        return ""
    text = (resp.get("recall") or "").strip()
    return text[:char_limit]


def post_json(url, body, timeout=6):
    """POST json, return parsed dict or {} on any error (memory never raises into Hermes)."""
    try:
        req = urllib.request.Request(
            url, data=json.dumps(body).encode(),
            headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read() or b"{}")
    except Exception:
        return {}


def recall(base_url, session_id, query, k=5, char_limit=DEFAULT_CHAR_LIMIT, timeout=6):
    if is_trivial(query):
        return ""
    resp = post_json(base_url.rstrip("/") + "/recall", build_recall_body(session_id, query, k), timeout)
    return format_recall(resp, char_limit)


def remember(base_url, session_id, user_id, user, assistant, timeout=6):
    if is_trivial(user) and is_trivial(assistant):
        return {}
    return post_json(base_url.rstrip("/") + "/remember",
                     build_remember_body(session_id, user_id, user, assistant), timeout)
