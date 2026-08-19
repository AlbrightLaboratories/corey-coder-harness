"""Unit tests for corey_memory.client — pure request/response mapping (no network).

The provider (__init__.py) is a thin MemoryProvider wrapper over these functions;
keeping the HTTP mapping here lets us test it without importing the Hermes runtime.
"""
import importlib.util
import pathlib

_PATH = pathlib.Path(__file__).resolve().parent / "client.py"


def _load():
    spec = importlib.util.spec_from_file_location("corey_memory_client", _PATH)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


c = _load()


def test_build_recall_body_defaults_k():
    assert c.build_recall_body("s1", "q") == {"session_id": "s1", "query": "q", "k": 5}


def test_build_recall_body_honors_k():
    assert c.build_recall_body("s1", "q", k=3)["k"] == 3


def test_build_remember_body_shape():
    b = c.build_remember_body("s1", "corey", "hi", "hello")
    assert b == {"session_id": "s1", "user_id": "corey", "user": "hi", "assistant": "hello"}


def test_format_recall_joins_and_labels():
    resp = {"ok": True, "recall": "- what is X -> X is Y"}
    out = c.format_recall(resp)
    assert "X is Y" in out and out.strip() != ""


def test_format_recall_empty_is_blank():
    assert c.format_recall({"ok": True, "recall": ""}) == ""
    assert c.format_recall({"ok": False}) == ""
    assert c.format_recall(None) == ""


def test_format_recall_truncates():
    resp = {"ok": True, "recall": "x" * 9000}
    assert len(c.format_recall(resp, char_limit=1000)) <= 1000


def test_is_trivial_skips_greetings():
    assert c.is_trivial("hi") is True
    assert c.is_trivial("") is True
    assert c.is_trivial("refactor the auth module to use JWT") is False
