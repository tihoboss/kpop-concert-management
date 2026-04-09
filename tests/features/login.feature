Feature: Авторизация пользователей
  Как пользователь системы
  Я хочу войти в свой аккаунт
  Чтобы получить доступ к функциям в соответствии с моей ролью

  Background:
    Given я нахожусь на странице входа

  @positive
  Scenario Outline: Успешная авторизация с корректными данными
    When я выбираю роль "<role>"
    And я ввожу email "<email>"
    And я ввожу пароль "<password>"
    And я нажимаю кнопку "Войти"
    Then я должен быть перенаправлен на дашборд
    And должна отображаться роль "<roleDisplay>"

    Examples:
      | role      | email                | password | roleDisplay |
      | manager   | manager@jype.com     | demo123  | Менеджер    |
      | admin     | admin@jype.com       | demo123  | Администратор |
      | coordinator | coordinator@jype.com | demo123  | Координатор |

  @negative
  Scenario: Неудачная авторизация с неверным паролем
    When я выбираю роль "manager"
    And я ввожу email "manager@jype.com"
    And я ввожу пароль "wrongpassword"
    And я нажимаю кнопку "Войти"
    Then должно отобразиться сообщение об ошибке "Неверный пароль"

  @negative
  Scenario: Неудачная авторизация с несуществующим email
    When я выбираю роль "manager"
    And я ввожу email "nonexistent@test.com"
    And я ввожу пароль "demo123"
    And я нажимаю кнопку "Войти"
    Then должно отобразиться сообщение об ошибке "Пользователь не найден"