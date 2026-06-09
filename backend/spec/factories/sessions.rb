# spec/factories/sessions.rb
FactoryBot.define do
  factory :session do
    association :user
    session_token { SecureRandom.urlsafe_base64(32) }
    expires_at { 24.hours.from_now }
  end
end
