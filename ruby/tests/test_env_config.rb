require 'minitest/autorun'
require_relative '../src/env_config'
require_relative './mock_env_loader'

#############################################################################
# TEST GLOBAL SETUP                                                         #
#############################################################################

GLOBAL_CATEGORY = 'GLOBAL'
GENE_CATEGORY = 'GENE'
MANY_CATEGORIES = [GLOBAL_CATEGORY, GENE_CATEGORY]
SECTION_NAME = 'section'
NON_EXISTING_SECTION_NAME = 'non-existing-section'
NON_EXISTING_KEY_NAME = 'non-existing-key'
GLOBAL_KEY_NAME_A = 'globalKeyA'
GLOBAL_KEY_VALUE_A = 1
GENE_KEY_NAME_A = 'geneKeyA'
GENE_KEY_VALUE_A = 1
DEFAULT_VALUE = 'default-val'

MOCK_DATA = {
  GLOBAL_CATEGORY => { SECTION_NAME => { GLOBAL_KEY_NAME_A => GLOBAL_KEY_VALUE_A } },
  GENE_CATEGORY => { SECTION_NAME => { GENE_KEY_NAME_A => GENE_KEY_VALUE_A } }
}

ENV['TWIST_ENV'] = 'dummy_env'
OSVars.instance.init
loader = GithubMockEnvConfig.new
loader.set_env('dummy_env', [])
loader.mock_set_categories([GLOBAL_CATEGORY, GENE_CATEGORY])
loader.mock_set_data(MOCK_DATA)
EnvConfig.instance.inject_loader(loader)

#############################################################################
# IMPLEMENTATION                                                            #
#############################################################################

class TestEnvConfig < Minitest::Test
  def test_none_existing_section_returns_default
    expected = DEFAULT_VALUE
    actual = EnvConfig.get(GLOBAL_CATEGORY, NON_EXISTING_SECTION_NAME, NON_EXISTING_KEY_NAME, expected)

    assert_equal expected, actual
  end

  def test_none_existing_key_returns_default
    expected = DEFAULT_VALUE
    actual = EnvConfig.get(GLOBAL_CATEGORY, SECTION_NAME, NON_EXISTING_KEY_NAME, expected)

    assert_equal expected, actual
  end

  def test_none_existing_category_throws_exception
    assert_raises(StandardError) {
      EnvConfig.get('DUMMY', SECTION_NAME, NON_EXISTING_KEY_NAME)
    }
  end

  def test_existing_key_to_return_actual_value
    expected = GENE_KEY_VALUE_A
    actual = EnvConfig.get(GENE_CATEGORY, SECTION_NAME, GENE_KEY_NAME_A)

    assert_equal actual, expected
  end

  def test_existing_key_to_return_actual_value_even_when_default_provided
    expected = GENE_KEY_VALUE_A
    actual = EnvConfig.get(GENE_CATEGORY, SECTION_NAME, GENE_KEY_NAME_A, DEFAULT_VALUE)

    assert_equal actual, expected
  end

  def test_get_none_key_section_to_return_whole_section
    expected = { GENE_KEY_NAME_A => GENE_KEY_VALUE_A }
    actual = EnvConfig.get(GENE_CATEGORY, SECTION_NAME, nil)

    assert_equal actual, expected
  end

  def test_get_none_section_to_return_whole_category_config
    expected = { SECTION_NAME => { GENE_KEY_NAME_A => GENE_KEY_VALUE_A } }
    actual = EnvConfig.get(GENE_CATEGORY)

    assert_equal actual, expected
  end
end
