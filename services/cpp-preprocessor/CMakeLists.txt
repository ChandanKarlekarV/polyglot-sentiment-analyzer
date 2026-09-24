# CMakeLists.txt
cmake_minimum_required(VERSION 3.15)
project(CppPreprocessor CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find MongoDB C++ Driver
find_package(mongocxx REQUIRED)
find_package(bsoncxx REQUIRED)

# Find SimpleAmqpClient (RabbitMQ)
find_package(SimpleAmqpClient REQUIRED)

add_executable(cpp-preprocessor main.cpp)

# Link Libraries
target_link_libraries(cpp-preprocessor PRIVATE 
    mongo::mongocxx_shared
    mongo::bsoncxx_shared
    SimpleAmqpClient
)
