require 'minitest/autorun'
require_relative '../src/env_config'
require_relative '../src/utils/logger'
require_relative '../src/config_context_handler'

Log.instance.init('info')

MOCK_CONF_NO_CONTEXT = { 'mitzi' => ' miao ' }
MOCK_CONF_WITH_CONTEXT_REF = { 'mitzi' => ' {{ miao }} ' }
MOCK_CONF_NO_CONTEXT_REF = {
  CONTEXT_DECLARATION_KEY => {
    'x' => 1
  },
  'mitzi' => ' miao '
}
MOCK_CONF = {
  CONTEXT_DECLARATION_KEY => {
    'staging' => { 'test_str' => '__val__', 'test_int' => 1974 },
    'russian' => { 'thanks' => 'spasibo!' },
    'hebrew' => { 'thanks' => 'toda!' }
  },
  'data' => {
    'str' => '{{ test_str }}',
    'mixed_str' => 'ABCD{{    test_str}}ABCD',
    'int' => '{{test_int}}',
    'thanks' => '{{thanks}}'
  }
}

MOCK_COMPOSITE_CONF = {
  CONTEXT_DECLARATION_KEY => {
    'staging' => { 'test_str' => 'oren', 'test_int' => 1974 },
    'russian' => { 'thanks' => 'spasibo!' },
    'hebrew' => { 'thanks' => 'toda!' }
  },
  'data' => {
    'str' => '{{ test_str }}',
    'mixed_str' => 'ABCD{{    test_str}}ABCD',
    'int' => '{{test_int}}',
    'thanks' => '{{ test_str }}, {{thanks}}'
  }
}

#############################################################################
# TEST IMPLEMENTATION                                                       #
#############################################################################

def deep_copy(src)
  Marshal.load(Marshal.dump(src))
end

class TestConfigContext < Minitest::Test
  def test_no_context_in_conf_yields_original_data
    testee = EnvConfigContext.new('dummy_env_name')
    testee.add('mitzi', 'woofwoof')

    actual = testee.process(MOCK_CONF_NO_CONTEXT)
    expected = deep_copy(MOCK_CONF_NO_CONTEXT)

    assert_equal expected, actual
  end

  def test_context_without_ref_in_conf_yields_original_data
    testee = EnvConfigContext.new('dummy_env_name')
    testee.add('mitzi', 'woofwoof')

    actual = testee.process(MOCK_CONF_NO_CONTEXT_REF)
    expected = deep_copy(MOCK_CONF_NO_CONTEXT_REF)
    expected[CONTEXT_DECLARATION_KEY].clear
    expected.delete(CONTEXT_DECLARATION_KEY)

    assert_equal expected, actual
  end

  def test_context_and_data_yield_modified_version
    testee = EnvConfigContext.new('staging')
    testee.add('language', 'russian')

    actual = testee.process(MOCK_CONF)
    expected = deep_copy(MOCK_CONF)
    expected[CONTEXT_DECLARATION_KEY].clear
    expected.delete(CONTEXT_DECLARATION_KEY)

    expected['data'] = {
      'str' => '__val__',
      'mixed_str' => 'ABCD__val__ABCD',
      'int' => 1974,
      'thanks' => 'spasibo!'
    }

    assert_equal expected, actual

    testee = EnvConfigContext.new('staging')
    testee.add('language', 'hebrew')

    actual = testee.process(MOCK_CONF)
    expected = deep_copy(MOCK_CONF)
    expected[CONTEXT_DECLARATION_KEY].clear
    expected.delete(CONTEXT_DECLARATION_KEY)

    expected['data'] = {
      'str' => '__val__',
      'mixed_str' => 'ABCD__val__ABCD',
      'int' => 1974,
      'thanks' => 'toda!'
    }

    assert_equal expected, actual
  end

  def test_context_and_composite_data_yield_modified_version
    testee = EnvConfigContext.new('staging')
    testee.add('language', 'russian')

    actual = testee.process(MOCK_COMPOSITE_CONF)
    expected = deep_copy(MOCK_COMPOSITE_CONF)
    expected[CONTEXT_DECLARATION_KEY].clear
    expected.delete(CONTEXT_DECLARATION_KEY)

    expected['data'] = {
      'str' => 'oren',
      'mixed_str' => 'ABCDorenABCD',
      'int' => 1974,
      'thanks' => 'oren, spasibo!'
    }

    assert_equal expected, actual
  end

  def test_validation_that_when_finds_template_it_raises_exception
    actual = nil
    begin
      testee = { 'dummy': 'asdfadsfasd {{ aaa     }}sdsdfsd' }
      actual = validate_no_template_left(testee)
    rescue StandardError
      pass
    end
    assert_nil actual

    begin
      testee = { 'dummy': '{{aaa}}' }
      actual = validate_no_template_left(testee)
    rescue StandardError
      pass
    end
    assert_nil actual

    begin
      testee = { 'dummy': '{{a_a-A.y}}' }
      actual = validate_no_template_left(testee)
    rescue StandardError
      pass
    end
    assert_nil actual
  end

  def test_validation_that_when_no_template_found_it_returns_false
    testee = { 'dummy': 'asdfadsfasd { aaa     }}sdsdfsd' }
    actual = validate_no_template_left(testee)
    assert_equal false, actual

    testee = { 'dummy': '{aaa}' }
    actual = validate_no_template_left(testee)
    assert_equal false, actual

    testee = { 'dummy': '{ { {a_a-A}}}' }
    actual = validate_no_template_left(testee)
    assert_equal false, actual

    testee = { 'dummy': '{ {a_a-A} }' }
    actual = validate_no_template_left(testee)
    assert_equal false, actual
  end
end
