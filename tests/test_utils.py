"""
Unit tests for agents/utils.py JSON parsing logic.
"""
from agents.utils import clean_json_response


class TestCleanJsonResponse:
    def test_plain_array(self):
        result = clean_json_response('[{"name": "Milk"}]')
        assert result == [{"name": "Milk"}]

    def test_strips_markdown_fences(self):
        result = clean_json_response('```json\n[{"name": "Eggs"}]\n```')
        assert result == [{"name": "Eggs"}]

    def test_strips_markdown_fences_no_lang(self):
        result = clean_json_response('```\n[{"name": "Bread"}]\n```')
        assert result == [{"name": "Bread"}]

    def test_strips_think_blocks(self):
        text = '<think>Let me think...</think>\n[{"name": "Apples"}]'
        result = clean_json_response(text)
        assert result == [{"name": "Apples"}]

    def test_strips_thinking_blocks(self):
        text = '<thinking>reasoning here</thinking>\n{"key": "value"}'
        result = clean_json_response(text)
        assert result == {"key": "value"}

    def test_extracts_json_from_prose(self):
        text = 'Here are the items: [{"name": "Butter", "quantity": 1.0, "unit": "kg"}]'
        result = clean_json_response(text)
        assert result[0]["name"] == "Butter"

    def test_invalid_json_raises(self):
        import pytest
        with pytest.raises(Exception):
            clean_json_response("this is not json at all")
