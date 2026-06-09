# spec/factories/login_attempts.rb
FactoryBot.define do
  factory :login_attempt do
    email { 'user@example.com' }
    attempted_at { Time.current }
    success { false }
  end
end
