require 'minitest/autorun'

class TestEnvConfig < Minitest::Test
  def setup
    @meme = nil
  end

  def test_that_kitty_can_eat
    assert_equal 'OHAI!', 'OHAI!'
  end

  def test_that_will_be_skipped
    skip 'test this later'
  end
end
