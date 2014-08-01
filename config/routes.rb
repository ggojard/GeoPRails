GeoP::Application.routes.draw do
  get "people/index"
  get "homes/search"
  get "people/show"
  get "organizations/show"
  get "buildings/show"
  get "floors/show"
  get "rooms/show"

  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)
  resources :homes
  resources :rooms
  resources :companies
  resources :people

  get '/login_page' => 'login#login'


  get '/buildings/:id' => 'buildings#show'
  get '/floors/:id' => 'floors#show'
  get '/floors/:id/edit' => 'floors#edit'
  get '/floors/:id/room/:room_id' => 'floors#show'
  put '/floors/:id' => 'floors#update'
  get '/floors/images/:id' => 'floors#image'
  get "floors/:id/json" => 'floors#show_json'

  get "rooms/:id/delete" => 'rooms#delete'

  # root 'homes#home'
  root 'companies#index'
  post 'upload' => 'homes#upload'
  get 'upload' => 'homes#upload'

  get '/search/:q' => 'homes#search'

  get '/organizations/:id' => 'organizations#show'


  get '/buildings/:id/export' => 'buildings#export'


  # map.connect ':controller/:action/:id'


  # get "/logout" => :to "admin/logout" # Add a custom sing out route for user sign out



  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
