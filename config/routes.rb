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
  resources :items
  resources :rooms
  resources :companies do
    post 'import', on: :collection
  end
  resources :organizations
  resources :people
  resources :floors
  resources :item_types
  resources :cuby


  get '/login_page' => 'login#login'
  get '/floors/:id' => 'floors#show'
  get '/floors/:id/edit' => 'floors#edit'
  get '/floors/:id/room/:room_id' => 'floors#show'
  put '/floors/:id' => 'floors#update'
  get '/floors/images/:id' => 'images#floor_image'
  get "floors/:id/json" => 'floors#show_json'
  # get '/companies/images/:id' => 'images#company_image'
  # get '/images/logo_small.png' => 'images#logo_small'
  get '/images/logo.png' => 'images#logo'
  get "rooms/:id/delete" => 'rooms#delete'

  get '/item_types/:id.qrcode.png' => 'item_types#qrcode'
  get '/items/:id.qrcode.png' => 'items#qrcode'


  root 'homes#show'
  # root 'companies#index'
  get '/companies/:id/export' => 'companies#export'
  get '/companies/:id/export_template' => 'companies#export_template'
  get '/companies/:id/organizations' => 'companies#organizations_hierarchy'

  post 'upload' => 'homes#upload'
  get 'upload' => 'homes#upload'

  get '/search/:q' => 'homes#search'
  get '/clean_repo' => 'homes#clean_repo'

  get '/organizations/:id' => 'organizations#show'

  get '/buildings/import' => 'buildings#import'
  get '/buildings/:id/export' => 'buildings#export'
  get '/buildings/:id/duplicate' => 'buildings#duplicate'
  get '/buildings/:id/delete_all' => 'buildings#delete_all'

  get '/admin/clear_cache' => 'homes#clear_cache'

  get '/items/search_to_add/:q' => 'items#search_to_add'
  # map.connect ':controller/:action/:id'

  resources :buildings


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
