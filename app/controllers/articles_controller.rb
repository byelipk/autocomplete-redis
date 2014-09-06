class ArticlesController < ApplicationController
  def index
    @articles = params[:ids] ? Article.find(params[:ids]) : Article.limit(20)

    render json: @articles, status: 200
  end

  def show
    render json: Article.find(params[:id]), status: 200
  end
end
