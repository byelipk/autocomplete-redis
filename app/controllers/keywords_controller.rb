class KeywordsController < ApplicationController
  def index
    @keywords = params[:ids] ? Keyword.find(params[:ids]) : Keyword.all
    render json: @keywords, status: 200
  end

  def show
    render json: Keyword.find(params[:id]), status: 200
  end
end
